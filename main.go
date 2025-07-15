package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

const (
	hostsPathWin  = "C:\\Windows\\System32\\drivers\\etc\\hosts"
	hostsPathUnix = "/etc/hosts"
	marker        = "# Managed by PortPilot"
	backupFile    = "backup.pilot"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: portpilot <command> [args...]")
		return
	}

	// Elevation check
	if !hasPermission() {
		relaunchAsAdmin()
		return
	}

	cmd := os.Args[1]
	switch cmd {
	case "addHost":
		if len(os.Args) < 3 {
			fmt.Println("Usage: portpilot addHost <domain1> [domain2 domain3...]")
			return
		}
		ensureBackupExists()
		for _, domain := range os.Args[2:] {
			handleAdd(domain)
		}
	case "removeHost":
		if len(os.Args) < 3 {
			fmt.Println("Usage: portpilot removeHost <domain1> [domain2 domain3...]")
			return
		}
		for _, domain := range os.Args[2:] {
			handleRemove(domain)
		}
	case "flushDns":
		handleFlush()
	case "restoreBackup":
		handleRestoreBackup()
	case "cleanupManaged":
		handleCleanupManaged()
	default:
		fmt.Println("❌ Unknown command")
	}
}

func getHostsPath() string {
	if runtime.GOOS == "windows" {
		return hostsPathWin
	}
	return hostsPathUnix
}

func ensureBackupExists() {
	hostsPath := getHostsPath()
	backupPath := hostsPath + "." + backupFile

	if _, err := os.Stat(backupPath); os.IsNotExist(err) {
		content, err := os.ReadFile(hostsPath)
		if err != nil {
			fmt.Println("⚠️ Could not create backup:", err)
			return
		}
		err = os.WriteFile(backupPath, content, 0644)
		if err != nil {
			fmt.Println("⚠️ Failed to write backup:", err)
			return
		}
		fmt.Println("🗂️ Backup created at", backupPath)
	}
}

func handleAdd(domain string) {
	hostsPath := getHostsPath()
	entry := fmt.Sprintf("127.0.0.1 %s %s %s", domain, marker, time.Now().Format("02 Jan 2006 15:04:05"))

	content, _ := os.ReadFile(hostsPath)
	if strings.Contains(string(content), domain) {
		fmt.Println("✔️", domain, "already present")
		return
	}

	f, err := os.OpenFile(hostsPath, os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Println("❌ Cannot write to hosts file:", err)
		return
	}
	defer f.Close()

	if _, err := f.WriteString("\n" + entry + "\n"); err != nil {
		fmt.Println("❌ Failed to write:", err)
		return
	}
	fmt.Println("✅ Added:", domain)
}

func handleRemove(domain string) {
	hostsPath := getHostsPath()
	in, err := os.Open(hostsPath)
	if err != nil {
		fmt.Println("❌ Read error:", err)
		return
	}
	defer in.Close()

	var outLines []string
	scanner := bufio.NewScanner(in)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, domain) && strings.Contains(line, marker) {
			continue
		}
		outLines = append(outLines, line)
	}
	os.WriteFile(hostsPath, []byte(strings.Join(outLines, "\n")), 0644)
	fmt.Println("🧹 Removed:", domain)
}

func handleFlush() {
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = exec.Command("ipconfig", "/flushdns")
	} else {
		cmd = exec.Command("sudo", "dscacheutil", "-flushcache")
	}
	err := cmd.Run()
	if err != nil {
		fmt.Println("❌ Flush failed:", err)
		return
	}
	fmt.Println("✅ DNS cache flushed")
}

func handleRestoreBackup() {
	hostsPath := getHostsPath()
	backupPath := hostsPath + "." + backupFile
	input, err := os.ReadFile(backupPath)
	if err != nil {
		fmt.Println("❌ Could not read backup:", err)
		return
	}
	err = os.WriteFile(hostsPath, input, 0644)
	if err != nil {
		fmt.Println("❌ Restore failed:", err)
		return
	}
	fmt.Println("✅ Restored original hosts file")
}

func handleCleanupManaged() {
	hostsPath := getHostsPath()
	in, err := os.Open(hostsPath)
	if err != nil {
		fmt.Println("❌ Read error:", err)
		return
	}
	defer in.Close()

	var outLines []string
	scanner := bufio.NewScanner(in)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, marker) {
			continue
		}
		outLines = append(outLines, line)
	}
	os.WriteFile(hostsPath, []byte(strings.Join(outLines, "\n")), 0644)
	fmt.Println("🧹 Removed all managed entries")
}

// 🔐 Elevation Helpers (Windows)

func hasPermission() bool {
	if runtime.GOOS != "windows" {
		return true
	}
	file, err := os.OpenFile(getHostsPath(), os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return false
	}
	file.Close()
	return true
}

func relaunchAsAdmin() {
	exePath, _ := os.Executable()
	args := strings.Join(os.Args[1:], " ")
	cmd := exec.Command("powershell", "-Command",
		fmt.Sprintf(`Start-Process -FilePath "%s" -ArgumentList '%s' -Verb RunAs`, exePath, args))
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	cmd.Run()
}

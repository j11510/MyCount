$pinfo = New-Object System.Diagnostics.ProcessStartInfo
$pinfo.FileName = "ssh"
$pinfo.Arguments = "-p 8022 -v -o StrictHostKeyChecking=no -tt u0_a249@192.168.1.113 `"echo hello`""
$pinfo.RedirectStandardInput = $true
$pinfo.RedirectStandardOutput = $true
$pinfo.RedirectStandardError = $true
$pinfo.UseShellExecute = $false
$pinfo.CreateNoWindow = $true
$p = [System.Diagnostics.Process]::Start($pinfo)
Start-Sleep -Seconds 4
$p.StandardInput.WriteLine("admin1234")
$p.StandardInput.Flush()
Start-Sleep -Seconds 5
$out = $p.StandardOutput.Read() # Try reading one char or something
Write-Output "Testing simple echo..."
$p.Kill()

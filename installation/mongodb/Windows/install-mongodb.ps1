# Sätt variabler
$MongodbVersion = "4.4.6"
$MongodbUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-$MongodbVersion.zip"
$DownloadPath = "$env:TEMP\mongodb.zip"
$InstallPath = "C:\Program Files\MongoDB"
$BinPath = "$InstallPath\bin"
$DataPath = "C:\data\db"
$LogPath = "C:\data\log\mongod.log"
$MongodbExe = "$BinPath\mongod.exe"

# Skapa nödvändiga kataloger
if (-Not (Test-Path -Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force
}
if (-Not (Test-Path -Path $DataPath)) {
    New-Item -ItemType Directory -Path $DataPath -Force
}
if (-Not (Test-Path -Path (Split-Path -Path $LogPath))) {
    New-Item -ItemType Directory -Path (Split-Path -Path $LogPath) -Force
}

# Ladda ner MongoDB
Invoke-WebRequest -Uri $MongodbUrl -OutFile $DownloadPath

# Packa upp MongoDB
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($DownloadPath, $InstallPath)

# Ta bort zip-filen
Remove-Item -Path $DownloadPath

# Skapa en MongoDB-konfigurationsfil
$ConfigPath = "$InstallPath\mongod.cfg"
$configContent = @"
systemLog:
  destination: file
  path: "$LogPath"
storage:
  dbPath: "$DataPath"
net:
  bindIp: 127.0.0.1
  port: 27017
"@
$configContent | Out-File -FilePath $ConfigPath -Encoding utf8

# Skapa en MongoDB-tjänst
New-Service -Name "MongoDB" -BinaryPathName "`"$MongodbExe`" --config `"$ConfigPath`"" -DisplayName "MongoDB" -Description "MongoDB Database Server" -StartupType Automatic

# Starta MongoDB-tjänsten
Start-Service -Name "MongoDB"

Write-Output "MongoDB installation completed!"

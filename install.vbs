Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

appDir = WshShell.ExpandEnvironmentStrings("%LOCALAPPDATA%\UGL-OPE")
desktopDir = WshShell.SpecialFolders("Desktop")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

If Not fso.FolderExists(appDir) Then
    fso.CreateFolder(appDir)
End If

exeSource = scriptDir & "\UGL-OPE.exe"
exeTarget = appDir & "\UGL-OPE.exe"

If fso.FileExists(exeSource) Then
    fso.CopyFile exeSource, exeTarget, True
End If

Set shortcut = WshShell.CreateShortcut(desktopDir & "\UGL-OPE.lnk")
shortcut.TargetPath = exeTarget
shortcut.WorkingDirectory = appDir
shortcut.IconLocation = exeTarget & ", 0"
shortcut.Description = "Urban Gaz Limited OPE Platform"
shortcut.Save

MsgBox "UGL-OPE platform installed successfully!" & vbCrLf & vbCrLf & "A shortcut named 'UGL-OPE' has been placed on your Desktop.", 64, "UGL-OPE One-Click Installer"

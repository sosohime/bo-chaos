# Codex Pets

这里放 bo-chaos 维护的 Codex 桌面宠物资源。当前包含 `ExpertBo` 和 `影流Bo`，后续可以在 `pets/` 下继续增加其他宠物。

![ExpertBo preview](../../apps/frontend-astro/public/codex-pets/expertbo-preview.png)
![影流Bo preview](../../apps/frontend-astro/public/codex-pets/shadowbo-preview.png)

GitHub 地址：<https://github.com/sosohime/bo-chaos/tree/main/packages/codex-pets>

## ExpertBo

### macOS / Linux / Git Bash

复制下面这条命令到 Codex 或终端执行，即可从 GitHub 拉取资源并安装到本地 `~/.codex/pets/expertbo`：

```bash
bash -lc "$(curl -fsSL https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/codex-pets/install-expertbo.sh)"
```

### Windows PowerShell

复制下面这条命令到 Windows PowerShell 执行，即可安装到 `%USERPROFILE%\.codex\pets\expertbo`：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/codex-pets/install-expertbo.ps1 | iex"
```

安装后在 Codex 里打开 `Settings -> Appearance -> Pets`，点击 `Refresh`，选择 `ExpertBo`。如果画面没有立即更新，关闭再打开 `Wake Pet`。

## 影流Bo

### macOS / Linux / Git Bash

复制下面这条命令到 Codex 或终端执行，即可从 GitHub 拉取资源并安装到本地 `~/.codex/pets/shadowbo`：

```bash
bash -lc "$(curl -fsSL https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/codex-pets/install-shadowbo.sh)"
```

### Windows PowerShell

复制下面这条命令到 Windows PowerShell 执行，即可安装到 `%USERPROFILE%\.codex\pets\shadowbo`：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/sosohime/bo-chaos/main/packages/codex-pets/install-shadowbo.ps1 | iex"
```

安装后在 Codex 里打开 `Settings -> Appearance -> Pets`，点击 `Refresh`，选择 `影流Bo`，也就是 `custom:shadowbo`。

## 手动安装

如果需要手动安装，复制对应宠物目录下的 `pet.json` 和 `spritesheet.png` 到 Codex 自定义宠物目录。

ExpertBo：

```text
~/.codex/pets/expertbo/
```

```text
~/.codex/pets/expertbo/
├── pet.json
└── spritesheet.png
```

影流Bo：

```text
~/.codex/pets/shadowbo/
```

```text
~/.codex/pets/shadowbo/
├── pet.json
└── spritesheet.png
```

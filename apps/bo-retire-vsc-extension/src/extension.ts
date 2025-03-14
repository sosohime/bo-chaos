// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { dayjs } from "@mono/utils";
import { tuixiu } from "@mono/const";

function completeToTargetDigits(number: number | string, digits = 2) {
  return String(number).padStart(digits, "0");
}

function getCountDown(tuixiu: dayjs.Dayjs): string {
  const now: dayjs.Dayjs = dayjs();
  const diff = tuixiu.diff(now);
  const duration = dayjs.duration(diff);

  // 修改计算逻辑
  const totalHours = Math.floor(duration.asHours());
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return `${days} 天 ${completeToTargetDigits(hours)}:${completeToTargetDigits(minutes)}:${completeToTargetDigits(seconds)}`;
}

const { boTuiXiuDay } = tuixiu;

let myStatusBarItem: vscode.StatusBarItem;
let timer: NodeJS.Timeout | null = null;

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "bo-retire" is now active!');

  const duojiutuixiuCommand = vscode.commands.registerCommand(
    "bo-retire.duojiutuixiu",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage(
        `😁 倒计时: ${getCountDown(boTuiXiuDay)}`,
      );
    },
  );
  context.subscriptions.push(duojiutuixiuCommand);

  const showTuixiuStatusBarState = "bo-retire.showStatusBar";
  const SHOW_STATUS_BAR_STATE_ENUM = {
    show: "show",
    hide: "hide",
  };
  context.globalState.setKeysForSync([showTuixiuStatusBarState]);
  console.log("ok", context.globalState.get(showTuixiuStatusBarState));

  if (
    context.globalState.get(showTuixiuStatusBarState) ===
    SHOW_STATUS_BAR_STATE_ENUM.show
  ) {
    if (!timer) {
      timer = setInterval(() => {
        updateStatusBarItem();
      }, 1000);
    }
  }

  const showTuixiuCommand = "bo-retire.showtuixiu";
  const showTuixiu = vscode.commands.registerCommand(showTuixiuCommand, () => {
    context.globalState.update(
      showTuixiuStatusBarState,
      SHOW_STATUS_BAR_STATE_ENUM.show,
    );
    if (!timer) {
      timer = setInterval(() => {
        updateStatusBarItem();
      }, 1000);
    }
  });
  context.subscriptions.push(showTuixiu);

  const hideTuixiuCommand = "bo-retire.hidetuixiu";
  const hideTuixiu = vscode.commands.registerCommand(hideTuixiuCommand, () => {
    context.globalState.update(
      showTuixiuStatusBarState,
      SHOW_STATUS_BAR_STATE_ENUM.hide,
    );
    myStatusBarItem.hide();
    timer && clearInterval(timer);
  });
  context.subscriptions.push(hideTuixiu);

  const clickTuixiuCommand = "bo-retire.gotuixiu";
  const goWebSite = vscode.commands.registerCommand(clickTuixiuCommand, () => {
    vscode.env.openExternal(
      vscode.Uri.parse("https://yuanbo.online/tuixiu/bo/"),
    );
  });
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  myStatusBarItem.command = clickTuixiuCommand;
  context.subscriptions.push(goWebSite);
  context.subscriptions.push(myStatusBarItem);
}

function updateStatusBarItem() {
  myStatusBarItem.show();
  myStatusBarItem.text = `😁 倒计时: ${getCountDown(boTuiXiuDay)}`;
}

// This method is called when your extension is deactivated
export function deactivate() {
  timer && clearInterval(timer);
  myStatusBarItem.dispose();
}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import { Configuration, OpenAIApi } from "openai";

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "ai-code-generator-vscode-extension" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "ai-code-generator-vscode-extension.generateCode",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No hay un editor de texto activo.");
        return;
      }
      const document = editor.document;
      const input = `${
        document.lineAt(0).text
      }\nGive me only the code, I don't want any verbosity\n`.trim();
      editor.edit((editBuilder) => {
        editBuilder.delete(new vscode.Range(0, 0, 0, input.length));
      });
      vscode.window.showInformationMessage("Loading...");
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: input }],
      });

      const positionToInsert = editor.selection.active; // You can also use other positions, like the start or end of the file.

      const edit = new vscode.WorkspaceEdit();
      edit.insert(
        editor.document.uri,
        positionToInsert,
        completion.data.choices[0].message?.content || "fail"
      );

      await vscode.workspace.applyEdit(edit);
      vscode.window.showInformationMessage("Completed!");
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

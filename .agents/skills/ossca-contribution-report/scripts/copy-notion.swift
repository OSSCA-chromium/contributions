import AppKit
import Foundation

let arguments = Array(CommandLine.arguments.dropFirst())
if arguments == ["--help"] {
    print("Usage: swift copy-notion.swift <html-file> <text-file>")
    exit(0)
}
guard arguments.count == 2 else {
    fputs("Usage: swift copy-notion.swift <html-file> <text-file>\n", stderr)
    exit(2)
}
let htmlData = try Data(contentsOf: URL(fileURLWithPath: arguments[0]))
let plainText = try String(contentsOfFile: arguments[1], encoding: .utf8)
let item = NSPasteboardItem()
guard item.setData(htmlData, forType: .html), item.setString(plainText, forType: .string) else {
    fatalError("Could not prepare clipboard item")
}
let clipboard = NSPasteboard.general
clipboard.clearContents()
guard clipboard.writeObjects([item]), clipboard.data(forType: .html) == htmlData,
      clipboard.string(forType: .string) == plainText else {
    fatalError("Clipboard verification failed")
}
print("Clipboard verified: HTML (\(htmlData.count) bytes) and plain text (\(plainText.utf8.count) bytes)")

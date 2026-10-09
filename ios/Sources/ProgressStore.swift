import Foundation

/// Keeps a copy of all your projects in the app's Documents folder, so your progress
/// survives even if iOS ever clears the web view's storage.
/// The file shows up in the Files app under On My iPhone > Pip.
final class ProgressStore {
    private let fileURL: URL

    init() {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        fileURL = docs.appendingPathComponent("Pip Playground backup.json")
    }

    /// Runs before the editor starts. If the page's storage is empty but a backup exists,
    /// puts the backup back first, so the editor opens with your projects.
    func restoreScript() -> String {
        var backup = "null"
        if let data = try? Data(contentsOf: fileURL),
           (try? JSONSerialization.jsonObject(with: data)) is [String: Any],
           let text = String(data: data, encoding: .utf8) {
            backup = text
        }
        return """
        (function () {
          var backup = \(backup);
          try {
            if (backup && !localStorage.getItem('pip:projects')) {
              for (var key in backup) {
                if (Object.prototype.hasOwnProperty.call(backup, key)) localStorage.setItem(key, backup[key]);
              }
            }
          } catch (e) {}
        })();
        """
    }

    /// Watches every save the editor makes and sends a copy to the app.
    /// The GitHub token is left out, so it never lands in a file you can see in Files.
    static let mirrorScript = """
    (function () {
      var handler = window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.pipSave;
      if (!handler) return;
      var skip = { 'pip:gh_token': 1, 'pip:gh_user': 1, 'pip:gh_result': 1 };
      var timer = 0;
      function snapshot() {
        clearTimeout(timer); timer = 0;
        try {
          var out = {};
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf('pip:') === 0 && !skip[k]) out[k] = localStorage.getItem(k);
          }
          handler.postMessage(JSON.stringify(out));
        } catch (e) {}
      }
      function changed(store) {
        if (store !== window.localStorage) return;
        if (document.visibilityState === 'hidden') snapshot();
        else if (!timer) timer = setTimeout(snapshot, 600);
      }
      var proto = Storage.prototype, set = proto.setItem, remove = proto.removeItem, clear = proto.clear;
      proto.setItem = function () { var r = set.apply(this, arguments); changed(this); return r; };
      proto.removeItem = function () { var r = remove.apply(this, arguments); changed(this); return r; };
      proto.clear = function () { var r = clear.apply(this, arguments); changed(this); return r; };
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden' && timer) snapshot();
      });
      window.addEventListener('pagehide', function () { if (timer) snapshot(); });
    })();
    """

    func save(_ json: String) {
        guard let data = json.data(using: .utf8),
              (try? JSONSerialization.jsonObject(with: data)) is [String: Any] else { return }
        try? data.write(to: fileURL, options: .atomic)
    }
}

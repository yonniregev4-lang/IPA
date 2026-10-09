# Pip Playground

A code editor for HTML, CSS and JavaScript with a live preview, VS Code-style autocomplete, projects, GitHub publishing, and Pip the fox who catches your typos.

```
server.js        small Node server: serves the editor and handles "Connect with GitHub"
package.json     tells Render how to start it
public/          the editor itself (index.html, assets/, sw.js, icon, manifest)
ios/             the iPhone app (Swift), built into an .ipa by GitHub
.github/         the workflow that builds the .ipa on GitHub's Mac computers
render.yaml      optional one-click Render setup
```

No dependencies. Needs Node 18 or newer.

## 1. Put it on Render

1. Upload all of these files to a GitHub repository (keep the `public` folder).
2. In Render, choose **New > Web Service** and pick that repository.
3. Fill in:
   - **Language:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance type:** Free
4. Deploy. You get a link like `https://pip-playground.onrender.com`.

The editor works now. Next, turn on the **Connect with GitHub** button.

## 2. Turn on "Connect with GitHub"

### Make a GitHub OAuth App

1. Open https://github.com/settings/developers and choose **OAuth Apps > New OAuth App**.
2. Fill in, using your own Render link:
   - **Application name:** `Pip Playground`
   - **Homepage URL:** `https://pip-playground.onrender.com`
   - **Authorization callback URL:** `https://pip-playground.onrender.com/auth/github/callback`
3. Choose **Register application**.
4. Copy the **Client ID**. Then choose **Generate a new client secret** and copy the secret.

### Give the keys to Render

In Render, open your service, then **Environment**, and add:

| Key | Value |
| --- | --- |
| `GITHUB_CLIENT_ID` | the Client ID |
| `GITHUB_CLIENT_SECRET` | the client secret |

Save. Render restarts the service, and **Connect with GitHub** appears under **Publish**.

Keep the client secret private. Never put it in the code or in the repository.

### What people see

1. They tap **Publish**, then **Connect with GitHub**.
2. GitHub asks if they allow Pip Playground to use their repositories.
3. They tap **Authorize** and land back in the editor, connected.

## 3. Publishing projects

Under **Publish**:

- **Commit now** sends every file of the project to the repository as one commit. Pip creates the repository if it doesn't exist yet.
- **Commit automatically** commits a few seconds after you stop typing, and right away when you press Ctrl+S.
- **Put the site online** turns on GitHub Pages. The site appears at `https://<you>.github.io/<repo>/` about a minute later. On a free GitHub plan the repository has to be public.

GitHub access is kept in the browser only (localStorage). **Disconnect** removes it from the browser. To remove Pip's access completely, revoke it at https://github.com/settings/applications.

## Hosting on Netlify instead

Netlify runs "Connect with GitHub" as Netlify Functions (in `netlify/functions`), using the settings in `netlify.toml`.

1. Put all of these files in a GitHub repository.
2. In Netlify, choose **Add new site > Import an existing project** and pick that repository. Netlify reads `netlify.toml` by itself, so leave the build settings as they are.
3. In your GitHub OAuth App, set **Authorization callback URL** to your Netlify link plus `/auth/github/callback`, such as `https://your-site.netlify.app/auth/github/callback`.

Dragging files onto Netlify Drop does not run functions. The editor works that way, but only with **Use a token instead**.

The Client ID and secret are temporarily written in `netlify/lib/github.mjs` and `server.js`. They run on the server and are never sent to visitors, but anyone who can read the repository can see them. Later:

1. Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in Netlify (**Site configuration > Environment variables**) or in Render (**Environment**).
2. Delete the two written-in values from those files.
3. On GitHub, generate a new client secret and delete the old one.

## iPhone app (.ipa)

The `ios` folder is a small native app that runs the editor from files inside the app, so it works with no internet.

### Get the .ipa

1. Upload everything to your GitHub repository, including the `ios` and `.github` folders.
2. Open the repository's **Actions** tab. The **Build iPhone app** workflow starts by itself after each push (or tap **Run workflow**). It takes about 5 minutes.
3. When it finishes, open the repository's **Releases** page and download `PipPlayground.ipa`.

If you upload from an iPhone and the `.github` folder doesn't show up, make the file by hand: **Add file > Create new file**, name it `.github/workflows/build-ipa.yml`, and paste in the contents of that file.

### Install it

iPhones only run apps signed with an Apple ID, so the .ipa has to be signed while it's installed:

- **Sideloadly** (Windows or Mac, free): plug in your iPhone, drop the .ipa in, sign in with your Apple ID. Then on the iPhone, open **Settings > General > VPN & Device Management** and trust your Apple ID. Turn on **Developer Mode** if iOS asks (Settings > Privacy & Security).
- **AltStore** (free): same idea, and it can refresh the app over Wi-Fi.
- With a free Apple ID the app stops opening after 7 days until you sign it again. A paid Apple Developer account ($99 a year) lasts a year.

### Your progress

- Projects are saved as you type, and right away when you leave the app.
- The app also keeps a backup in its own folder: **Files > On My iPhone > Pip > Pip Playground backup.json**. If iOS ever clears the editor's storage, the app restores your projects from it on the next launch.
- Your GitHub token is never written to that backup file.
- Re-signing or updating the app keeps your projects. Deleting the app deletes them, so download a project as .zip first (it opens the share sheet).

In the app, use **Use a token instead** under Publish to connect GitHub.

### No computer?

Open your Netlify site in Safari, tap **Share > Add to Home Screen**. You get a Pip icon that opens full screen and works offline, with your progress saved, and nothing to sign or refresh.

## Speed

- Uses the device's own fonts, so nothing loads from other websites.
- `assets/` file names include a version code, so browsers keep them for a year and still get updates right away.
- `sw.js` keeps a copy of the editor on the device: repeat visits open instantly, even offline.
- Only the file you're looking at is drawn, and the preview doesn't rebuild while it's hidden.

## Troubleshooting

- **"redirect_uri is not associated with this application"**: the callback URL in the OAuth App must be exactly your site link plus `/auth/github/callback`. If it still fails, add a `BASE_URL` variable in Render set to your site link, such as `https://pip-playground.onrender.com`.
- **The free service is slow to open**: free Render web services sleep after 15 minutes without visitors and take about a minute to wake up.

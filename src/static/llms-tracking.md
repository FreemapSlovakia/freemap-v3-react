## Live tracking and the GPS recorder

### Live tracking

- Access: Main menu > Live tracking, or keyboard shortcut <kbd>g</kbd> <kbd>t</kbd>

Live tracking lets a user register their own devices (so others can follow their position) and watch other people's devices. Supported tracker apps/devices include OsmAnd, Locus, Traccar, and similar. It opens a **toolbar** with:

- **Watched devices** and **My tracked devices** — open the two managers (also reachable directly via <kbd>g</kbd> <kbd>w</kbd> and <kbd>g</kbd> <kbd>d</kbd>)
- **Visual** — what to draw for tracks: points, line, or line + points
- **Colorize by** — color the watched tracks by a per-point value; modes are shown only when the tracks carry the data, in groups set off by dividers: Elevation, Steepness / Time, Speed, Heading / Heart rate, Cadence, Power, Temperature / Battery, GSM signal (Inactive = solid track color). Every mode except Elevation, Speed and Time is premium — badged with a gem and disabled without premium access. While a mode is active, the dropdown's first item is a **Show colorizing legend** checkbox (set off by a divider) that toggles a color-scale legend below the toolbar
- **Elevation profile** — a chart of the selected (or first) track that reports altitude; uses the recorded altitudes as-is
- **⋮ menu** (shown once a watched track has more than one position) — **Copy to Tracks and data** takes a snapshot of the tracks into the track viewer, where they become ordinary loaded tracks (asking first whether to append to or replace what it already holds), and **Copy to drawing** turns them into editable drawing lines in the device's color and width, asking for a maximum deviation — derived from how dense the recording is — only when there is enough of it to be worth thinning. Both are copies: the live feed goes on and the watched devices stay. A selected device's toolbar carries the same menu, acting on that device alone

#### My tracked devices

Manage your own devices so others can watch your position via a watch token. The list shows each device's tracking token, name, max age, and creation date. Each device has:

- a button showing a **QR code** to quickly set up a tracker app (e.g. Traccar/OsmAnd)
- a menu with **Modify**, **Watch tokens**, and **Delete**
- an **Add new** button

**Device form:** Name (required), Token (required), Max Count (max number of stored locations), and Max Age (in minutes).

Each location sent by a device may carry properties such as altitude, speed, bearing, GSM/GPS signal strength, GPS precision, battery level, and a custom message.

**Watch tokens** (per device): independent share tokens, each with a created date, an optional validity window and a note. They can be copied, viewed, edited, or deleted, and the device owner can add new ones to share position with different people. The token form has **From**, **To**, and **Note** fields.

#### Watched devices

Manage devices you follow to see your friends' positions. Note: the watched-devices list is only reflected in the page URL — to persist it, save it via **My maps**.

Each watched device is added with a **New watched device** form: Watch Token (required), Label, Color, line Width (px), Since (date/time), Max Age (minutes), Max Count, Split Distance (meters), and Split Duration (minutes). Watched tracks render on the map; selecting one shows a small toolbar to delete or close it.

### GPS recorder

- Access: Main menu > GPS recorder
- URL path: `/#tools=gps-recorder`
- **Android only**, and it needs a separate app: the *Freemap GPS Recorder*, a self-hosted APK the tool links to when it isn't installed. The tool is hidden entirely on other platforms.

Records a GPS track with the Android app while the map shows it live, so the recording survives the browser being closed, backgrounded or killed — the phone does the recording, the page is a viewer and a remote control. The toolbar offers:

- **Record** / **Pause** — one button. Pausing keeps the recording; pressing Record again continues it as a new segment, drawn with a gap rather than a straight line across the break
- **Finish** (⏹) — ends the ride: the track becomes an ordinary loaded track in **Tracks and data** (elevation, colorize, the elevation profile and every export then work on it), a copy is kept in this browser, and only then does the app delete its own. Always asks for confirmation first, since the recorder is emptied either way; while a recording is still running the question also says the ride cannot be resumed afterwards. Asks whether to **append** or **replace** when geodata is already shown, the same as a file import
- **Delete recording** (🗑) — throws the recording away without taking it; shown only when there is one and nothing is recording
- a summary, opening a dropdown that lists every figure: distance, elapsed time, elevation above sea level, climb, current and average speed, accuracy, the number of satellites the last fix used, point and segment counts, and the time of the last fix. Ticking a row also shows that figure in the summary itself, so the toolbar can be made to say whatever is worth a glance on the ride; distance and elapsed time are ticked to begin with, the choice is remembered in this browser, and with nothing ticked the summary shrinks to an ℹ button
- **Elevation profile** (📈) — the profile of the ride so far, redrawn as fixes arrive, with a break at each pause; shown once two fixes carry an altitude. The recorded altitude is drawn as measured, so no terrain model is credited under it
- **Recording settings** (⚙) — time between fixes, minimum distance between fixes, an accuracy limit for discarding poor fixes, the position source (the GPS receiver, which measures elevation per fix, or the fused GPS/wifi/sensor one, which places you better but repeats an elevation for seconds at a time) and the accuracy/battery trade-off that applies to the fused source (all applied by the app when a recording starts), plus: after what gap a new segment begins, whether **Locate me** is answered by the recorded fixes instead of the browser tracking GPS separately, whether to keep the screen on, and the colour and width of the line the recording is drawn with

While a recording is running the toolbar cannot be dismissed, only collapsed: closing it (or pressing <kbd>Esc</kbd>, or switching to another tool) leaves a strip with just a blinking red dot and an expand button (plus the tool's name where the screen is wide enough for it), so the recording is visible without opening the menu. The dot is itself a button, opening the same summary dropdown, read-only there since a collapsed toolbar has nothing to pin a figure to. Collapsing is remembered in this browser: neither a reload nor closing and reopening the tool undoes it, only the expand button does. The strip disappears once the recording is paused or finished.

The recording is also shown as a line on the map — red until the settings say otherwise — with its newest fix marked in the same colour; clicking either opens the tool.

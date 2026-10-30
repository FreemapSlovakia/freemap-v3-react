---
title: My maps
icon: FaRegMap
order: 580
---

A saved map keeps what you have put on the map under a name in your account: the [drawing](#show=manual/drawing) and [tracks](#show=manual/tracks), the planned route, watched devices, pinned search results and points of interest, together with the map layers and the position. You can open it again on any device, share it with a link and let others edit it. You need to be [logged in](#show=login) to save maps.

## Saving the current map

Open :FaBars: **Main menu** → :FaRegMap: **My maps** (<kbd>g</kbd> <kbd>m</kbd>), press :FaPlus: **Add new map**, enter a **Name** and press :FaSave: **Save**. Everything currently on the map goes into the new map.

When tracks or drawings are too large for the page address, the drawing toolbar shows the warning sign :FaExclamationTriangle.text-warning: – such data lives only in this browser. :FaEllipsisV: → :FaSave: **Save to my maps** in that toolbar saves it as a new map in the same way.

## The open map

While a saved map is open, a toolbar at the top of the screen shows **My map** with its name:

- :FaRegMap: opens the **My maps** dialog.
- :FaExclamationTriangle.text-warning: appears once you change something on the map – the changes are not saved yet.
- :FaSave: **Save** stores the changes in the map. On a map that is not yours and that you may not edit, it opens **Add new map** to save the contents as a new map of your own.
- :FaSync: **Reload map** discards the unsaved changes and opens the map as last saved.
- :FaUnlink: **Disconnect** closes the map and leaves its contents on the screen; :FaEraser: **Disconnect and clear** from the arrow next to it also clears them.

Unsaved changes survive a page reload in this browser, but only saving puts them in the map.

## The My maps dialog

The dialog lists your maps with the date each was created and last modified; the field at the top filters them by name. For each map:

- :FaCloudDownloadAlt: **Load** opens the map with its map layers and position. :FaShapes: **Load without background map and position** in the arrow next to it adds only its contents and keeps your current view. If the map already shows something, you choose whether to **Append** the loaded map or **Replace** what is there.
- :FaEdit: **Modify**, on your own maps, changes the **Name**, the **Editors** and **Available offline in this browser**.
- :FaTrash: **Delete**, on your own maps, removes the map after a confirmation.

On a narrow screen, some of these are in the :FaEllipsisV: menu of the map's row.

## Sharing and editors

While a saved map is open, its link is in the page address. Anyone who opens the link sees the map, even without logging in. Users added under **Editors** in :FaEdit: **Modify** can also save their changes to it; anyone else can only save it as a map of their own.

## Offline

A map marked **Available offline in this browser** opens even with no connection and carries an **Offline** badge in the list. :FaCog: → :BiWifiOff: **Make all available offline** marks all of your maps at once, :FaTimes: **Remove all from offline** clears the mark. Only the map's contents are kept this way – download the background map separately, see [Offline use](#show=manual/offline).

**Save** works offline too: the changes stay in this browser with an **Unsent** badge and are sent once the connection returns, or with :FaCog: → :FaCloudUploadAlt: **Send unsent changes**. If the map was changed elsewhere in the meantime, the badge says **Conflict** and the map's menu in the list holds **Save as a copy**, **Overwrite the server version** or **Discard my changes**.

---
title: GPS recorder
icon: FaCircle
order: 610
---

The GPS recorder is for recording your own trip on an Android phone. The recording is made by the separate Freemap GPS Recorder app, so it goes on even when the browser is closed; Freemap shows the track live on the map and controls the recording.

Open it from the :FaBars: main menu as :FaCircle: **GPS recorder**. It is offered only on Android – on other devices the tool is not in the menu, because the recorder app runs only there.

To share your position with others, see [Live tracking](#show=manual/tracking).

## Installing the recorder

Press :FaCircle: **Record**. If the recorder app is not installed, its installation file is downloaded; open it to install the app. Android may first ask you to allow installing apps from the browser.

When the recorder app opens, allow what it asks for – precise location, location in the background and notifications – and exempt it from battery optimization. Without these Android may stop a long recording.

## Recording

- :FaCircle: **Record** starts the recording. If the recorder app is not running, the button opens it, the recording starts and you are back in the browser.
- :FaPause: **Pause** pauses it. Pressing :FaCircle: **Record** again continues the same recording as a new segment, drawn with a gap instead of a straight line across the break.
- :FaStop: **Finish** ends the recording – see below.
- :FaTrash: **Delete recording** throws the recording away. It is shown only while nothing is being recorded.
- :FaChartArea: **Elevation profile** shows the profile of the trip so far, with a break at each pause. It appears once the recording has elevation.
- :FaCog: **Recording settings** – see below.

The recording is drawn on the map as a line, red unless you change it, with its latest position marked. Clicking the line opens the tool. While recording, :FaRegDotCircle: **Locate me** shows the position taken by the recorder.

## Figures

The button in the middle of the toolbar shows the distance and duration of the recording. Pressing it lists all the figures: distance, duration, elevation, climb, speed, average speed, accuracy, satellites, the number of points and segments, and the time of the last fix. Ticked values also show in the toolbar; with nothing ticked the button shows only :FaInfoCircle:.

The dot beside the figures is green while the map shows the recording live and grey when it does not. A spinner in its place means the connection to the recorder is being made or the track is being fetched, and the figures stop changing until it is done. The recording itself goes on regardless.

## The toolbar during a recording

While recording, the toolbar cannot be closed, only collapsed with :FaAngleLeft: **Collapse**. What is left is a strip with a blinking :FaCircle.text-danger: red dot, so you can see that the phone is recording. Pressing the dot shows the figures, :FaAngleRight: **Expand** brings the whole toolbar back. The strip goes away when you pause or finish the recording.

## Finishing a recording

:FaStop: **Finish** asks first, then stops the recording and moves the track to :MdShapeLine: **Drawing and data**, where you can see its elevation profile, colorize it, edit it and export it – see [Tracks and files](#show=manual/tracks). If something is already on the map, you choose whether to **Append** the track or **Replace** what is there.

The recorder app keeps nothing afterwards, so a finished recording cannot be continued and the next one starts a new track.

- If part of the recording has not reached the page yet, nothing is taken and nothing is deleted. Wait for the connection and finish again.
- If the browser cannot store the track reliably, the track is in Drawing and data but also stays in the recorder app. Export or save it, then delete the recording.

## Deleting a recording

:FaTrash: **Delete recording** asks first and then deletes the whole track in the recorder app. This cannot be undone. To keep the track, use :FaStop: **Finish** instead.

## Recording settings

**What gets recorded** applies from the next start of a recording:

- **Time between fixes** – how often a position is taken, in seconds.
- **Minimum distance between fixes** – in metres.
- **Discard fixes less accurate than** – in metres; leave it empty to keep every fix.
- **Position source** – **GPS receiver** measures the elevation at every fix; **Fused (GPS, wifi and sensors)** places you better among buildings and under trees, but repeats the same elevation for several seconds.
- **Accuracy** – the trade-off between accuracy and battery. It applies to the fused source only.

**Display**:

- **Start a new segment after a gap of** – in minutes; a longer break is drawn and exported as a gap. Leave it empty never to split.
- **Use the recording for “Locate me”** – with it off, :FaRegDotCircle: **Locate me** uses the browser's own GPS tracking instead.
- **Keep the screen on while recording**.
- The colour and width of the line.

:FaCheck: **Save** keeps the changes, :FaUndo: **Reset to default** puts back the defaults.

## When something goes wrong

The problems with the recorder are reported in a message over the map, together with a button that helps:

- **The recorder did not answer — it may not be running.** The app was closed or Android stopped it. Press **Open the recorder**; if the app is not installed, **Install the recorder**.
- **The recorder cannot record yet — open it and grant what it asks for.** Press **Open the recorder** and allow what it asks for.
- **The recorder may not survive a long recording**, with a list of what is missing – a permission or the exemption from battery optimization. **Open the recorder** takes you where you can set it.
- **Android would not let the recorder start from the background.** Start the recording in the recorder app, or allow the app to run without battery restrictions.
- **The browser refused access to the local network.** The connection to the recorder app stays inside the phone, but the browser treats it as the local network and asks for permission. Without it the map does not show the recording live, but the recording goes on. Press **Connect** and allow the access.
- **The recorder is too old for this version of the map.** Press **Update the recorder**.

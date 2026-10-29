---
title: AI assistants
icon: FaRobot
order: 870
---

For AI assistants there is a description of Freemap and, in a browser that supports it, a set of tools for working the map directly.

## Asking an assistant about Freemap

At [www.freemap.sk/llms.txt](https://www.freemap.sk/llms.txt) there is a description of Freemap written for AI assistants such as ChatGPT, Claude or Gemini. It links to further parts covering every function, all map layers and the parameters of a Freemap link. With it, an assistant can:

- explain how to do something in Freemap,
- build a link that opens Freemap with markers, lines or areas, a planned route, the chosen map layers or a particular place and zoom.

Give the assistant the address and ask your question, for example:

> Read https://www.freemap.sk/llms.txt and tell me how to export a planned route to GPX in Freemap.

> Read https://www.freemap.sk/llms.txt and make a Freemap link with markers on the summits of Kriváň, Rysy and Gerlachovský štít over the outdoor map.

The assistant must be able to open web pages. If it can't, copy the text of the page into the conversation instead. Open the link it gives you and check it – an assistant can make mistakes.

## Letting an assistant operate the map (WebMCP)

[WebMCP](https://github.com/webmachinelearning/webmcp) is a proposed web standard through which a web page makes tools available to an AI agent running in your browser. Freemap has tools to:

- move the map to a place, zoom to an area and switch map layers,
- search places and show a result on the map,
- plan a route through given points, with its length, time, turn-by-turn steps and climb,
- show objects (points of interest) of chosen categories and find out what is at a given point,
- add markers, draw lines and areas, list and remove drawings,
- read heights above sea level from the terrain model,
- save what is on the map as GPX, GeoJSON or KML,
- open a tool or dialog for you to carry on by hand, and clear the map.

What the agent changes with them is what you see on the map, just as if you had clicked it yourself.

### Enabling WebMCP in Chrome

WebMCP is experimental and the procedure may change. As of October 2026, according to [Chrome's WebMCP documentation](https://developer.chrome.com/docs/ai/webmcp):

1. In desktop Chrome, open `chrome://flags/#enable-webmcp-testing`, set the flag to **Enabled** and relaunch Chrome.
2. Install an agent that can call WebMCP tools. The documentation names two extensions, both separate from Gemini in Chrome: [Model Context Tool Inspector](https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd), into which you enter your own Gemini API key, and the example [WebMCP extension](https://github.com/GoogleChromeLabs/webmcp-extension).

Check the documentation for the current state before you start.

### Using it

Open [www.freemap.sk](https://www.freemap.sk/), open the agent and write what you want, for example:

> Show the Low Tatras on the outdoor map with hiking trails.

> Plan a bike route from Banská Bystrica to Donovaly and tell me how much climbing it has.

> Find the mountain huts in the current view and mark the one closest to the map centre.

You can carry on by hand from wherever the agent stopped.

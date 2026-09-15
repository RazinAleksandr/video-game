# The Marshlight Murder

A hand-drawn point-and-click detective mystery for the browser, in the spirit of *Detective Grimoire*.
No build step, no dependencies: open `index.html` and play.

> Marshlight Fair, a seaside fairground on the edge of Pellow Marsh. Last night its owner, Bartholomew Quill,
> was found dead inside his own Ghost Train. The locals blame the Marsh Wraith. You are Detective Ashcombe.
> You blame a person.

## Play it

- **Locally**: open `index.html` in any modern browser (or serve the folder with `python3 -m http.server`).
- **Online**: enable GitHub Pages for this repository (Settings → Pages → deploy from branch, root folder) and the game is live at the Pages URL.

Progress autosaves to the browser; the title screen offers **Continue Case** when a save exists.

## How to play

| Mechanic | What you do |
| --- | --- |
| **Explore** | Click anything that lights up in a scene. Arrows lead to other locations; the **Map** jumps between the ones you know. |
| **Talk** | Click a character to open a dialogue. Pick topics, or **Show them a clue** to confront them with evidence. Some clues only surface when the right person sees the right thing. |
| **Notebook** | Clues, suspects (with everything you have learned about them), and Case Notes with a gentle "what now?" nudge. |
| **Deduce** | In the Deductions tab, fill the blanks in a statement with clues. A correct deduction produces a *conclusion*, a new clue you can use like any other. |
| **Accuse** | Once all five deductions are solved, name the killer and back each part of the accusation with a clue. Wrong answers are forgiven; the truth is not. |

Keyboard: `N` notebook, `M` map, `Space`/`Enter` advance dialogue, `Esc` close panels.

## The case

Six locations (fairground entrance, the Ghost Train, inside the tunnel, Pellow Pier, the Quills' caravan, the old boathouse),
five suspects, sixteen clues, five deductions and one accusation. About 20 to 30 minutes for a first playthrough.

## Project layout

```
index.html        page shell and UI panels
css/style.css     cartoon UI: paper panels, ink outlines, dialogue box, notebook
js/art.js         all artwork as inline SVG: parametric characters, six scenes, map, clue icons
js/data.js        the story: scenes, hotspots, dialogue trees, clues, deductions, accusation
js/engine.js      game loop: state and autosave, scene rendering, dialogue queue, notebook, deductions, accusation
```

Everything visual is drawn procedurally in SVG with a small displacement filter for the hand-drawn wobble,
so the whole game is a few hundred kilobytes of text.

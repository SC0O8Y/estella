# Proteomics Journey — Estella edition

A native **Estella 3D teaching experience** that follows a sample from lysis through peptide identification, relative quantification, and statistical interpretation.

This is the Estella-based visual redesign of the earlier standalone HTML educational journey. It does **not** overwrite or import the original HTML artefacts, which were produced in the conversation rather than checked into this repository.

## Launch

1. Install the [Estella editor](https://estellaengine.com/#download) matching this engine release (or use the editor from your existing Estella installation).
2. Open `examples/proteomics-journey/project.esproject` using the editor.
3. Press **F5** to play. Alternatively export the example for web from the editor. A `project.esproject` file is an Estella project, **not** a standalone HTML file.
4. Navigate with the onscreen presentation controls.

The project uses native scene entities and renderer components (`MeshRenderer`, `Transform`, `Camera`, `Light`), native Estella UI controls and a TypeScript ECS director (`addPlugin` / `defineSystem`). The animation is not an HTML/CSS substitute for the engine.

## Controls

| Control | Effect |
| --- | --- |
| Previous / Next; left / right arrow | Move one stage without skipping its teaching text |
| Run this step; space | Restart and animate the current stage (~3.6 s) |
| Auto; P | Automatically complete each stage, pause briefly and advance |
| Active workflow; M | Cycle modes where available (LC trap/direct, instruments, DDA/DIA, DIA-NN/Spectronaut, Analyst suites) |
| Chapter buttons; keys 1–4 | Jump to one of the four sections |
| Page Up / Page Down | Previous / next stage |

**The stage can be discussed with the animation paused.** The next-stage control is separated from the animation control. The left narrative column presents the concept, observable visual cues, and caveats; the large 3D viewport does not sacrifice space to control buttons.

## Chapters and visuals

1. **Prepare the sample** — lysis and proteins, DNA shearing, BCA normalisation, reduction/alkylation, S-Trap binding and wash, tryptic digestion, STAGE-tip cleanup.
2. **Acquire spectra** — autosampler needle and transfer, NanoLC gradient elution, electrospray/desolvation, precursor MS1, DDA or DIA isolation, MS2 fragment ions, optional Eclipse SPS-MS3 TMT.
3. **Identify peptides** — FASTA digestion, candidate matching, target–decoy PSM FDR, peptide and protein inference.
4. **Quantify and interpret** — DDA LFQ XICs, DIA fragment-trace quantitation (DIA-NN or Spectronaut), TMT reporter ions, Analyst-suite statistical outputs and adjusted p-values.

Colours are consistent: cyan/blue peptides and precursors, violet modifications or fragments, yellow disulfides/isolation thresholds, orange contaminants/selection, green retained/accepted signals, red decoys or alternate effects. Different stages use different *native 3D geometric constructions*: strands, beads, transport columns, droplets, ion-path rings, spectra, chromatograms, inference networks and volcano points.

## Scientific scope and important limitations

The application is a **didactic scientific visualisation**, not calibrated instrument simulation or an OEM-exact cutaway.

- Mass-spectrometer scenes intentionally represent **conceptual ion transport and acquisition**. Exploris 480, Orbitrap Astral and Eclipse differ internally; selection of a model switches the teaching label and **does not claim geometrically accurate hardware**.
- FAIMS, trap/direct-injection plumbing and complete instrument-specific internals are not yet represented at engineering accuracy. The autosampler transfer is schematic.
- DDA and DIA isolation are distinct. DIA multiplexes fragment spectra; peptide extraction requires fragment co-elution and identification statistics.
- FASTA candidates do not equal observations. Target–decoy estimation controls the expected false discovery proportion in a collection, not an individual PSM's posterior probability.
- Separate PSM-, peptide- and protein-level inference/FDR; match-to-spectrum confidence is distinct from peptide quantity and differential-testing adjusted p-values.
- TMT reporter bar heights are illustrative; no real impurity correction, SPS isolation logic or abundance estimation is performed in this demo.
- Data-analysis visualisations are schematic and **contain no experimental, patient or clinical data**.

## Files

- `project.esproject` — launch metadata
- `assets/scenes/main.esscene` — native scene, presentation panels and a reusable pool of 3D meshes
- `src/stages.ts` — 21 teaching stages, caveats and mode choices
- `src/main.ts` — engine-driven geometry, animations, scene state, chapter navigation and controls
- `tsconfig.json` — TypeScript configuration

## Validation checklist

- [ ] Open project in the **matching Estella editor** with no missing components or asset imports.
- [ ] Play in editor, verify all 21 stages and 4 chapter shortcuts.
- [ ] Verify `Space`, arrow keys, mode selection, auto-play, and all UI click targets.
- [ ] Check text wrapping on 1600×900, 1366×768, 1920×1080 and tablet landscape; no clipping or overlapping labels.
- [ ] Inspect representative stages for colour contrast, mesh scale, and animated geometry.
- [ ] Confirm exported web build starts and renders; check performance on mobile GPU.
- [ ] Add instrument-specific ion-path geometry and real sample-prep assets in a follow-on precision pass.

This commit provides an **initial functional engine project and source**, but a successful editor launch / packaged web export has **not been verified in this environment**. All numerical plots in the scene are generated solely to explain qualitative concepts.

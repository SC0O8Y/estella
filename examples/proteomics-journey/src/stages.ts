// Proteomics Journey: scientifically scoped teaching states.
// The graphics are didactic, not a simulation of instrumental physics.
export type Visual =
  | 'sample' | 'dna' | 'assay' | 'reduce' | 'trap' | 'digest' | 'cleanup'
  | 'pickup' | 'lc' | 'esi' | 'ms1' | 'isolate' | 'fragment' | 'ms3'
  | 'fasta' | 'psm' | 'protein' | 'lfq' | 'dia' | 'tmt' | 'statistics';
export type Stage = {
  chapter: number;
  title: string;
  strap: string;
  visual: Visual;
  concept: string;
  observable: string;
  caution: string;
  action: string;
  modes?: readonly string[];
  labels: readonly [string, string, string];
};
export const CHAPTERS = [
  '01  PREPARE THE SAMPLE',
  '02  ACQUIRE THE SPECTRA',
  '03  DISCOVER THE PEPTIDES',
  '04  QUANTIFY AND INTERPRET',
] as const;

export const STAGES: readonly Stage[] = [
  {
    chapter: 0, title: 'Protein extraction', strap: 'FROM BIOLOGY TO SOLUTION', visual: 'sample',
    concept: 'Detergent, heating and mechanical disruption release proteins from cells and membranes.',
    observable: 'The compact protein population disperses throughout the lysate after mixing.',
    caution: 'A lysate also contains DNA, lipids, salts and other substances that can interfere with downstream steps.',
    action: 'Solubilise the sample', labels: ['Proteins', 'Lysis environment', 'Dispersed lysate'],
  },
  {
    chapter: 0, title: 'DNA shearing and clarification', strap: 'CONTROL VISCOSITY', visual: 'dna',
    concept: 'Sonication fragments long DNA. Clarification removes insoluble debris without assuming every protein remains soluble.',
    observable: 'Long DNA strands become shorter fragments; the protein-containing supernatant is retained.',
    caution: 'DNA is not a peptide; do not interpret these fragments as digestion products.',
    action: 'Shear the DNA', labels: ['Viscous DNA', 'Shear forces', 'Shorter fragments'],
  },
  {
    chapter: 0, title: 'Protein assay and normalisation', strap: 'MAKE INPUTS COMPARABLE', visual: 'assay',
    concept: 'A BCA assay estimates total protein. Sample input is adjusted so each digestion receives an intended protein amount.',
    observable: 'Wells give different signals initially, then normalised sample inputs converge on a common target.',
    caution: 'Equal protein mass does not guarantee identical proteome composition or extraction recovery.',
    action: 'Normalise protein input', labels: ['Assay wells', 'Concentration estimate', 'Equalised input'],
  },
  {
    chapter: 0, title: 'Reduction and alkylation', strap: 'CONTROL CYSTEINE CHEMISTRY', visual: 'reduce',
    concept: 'Reduction opens disulfide bridges; alkylation caps newly freed thiols and limits re-formation.',
    observable: 'Yellow disulfide connections break, and green modification caps appear on cysteine positions.',
    caution: 'The picture depicts both reactions sequentially; incomplete reduction or over-alkylation changes search assumptions.',
    action: 'Reduce, then alkylate', labels: ['Disulfide bridge', 'Reduced thiols', 'Alkylated cysteine'],
  },
  {
    chapter: 0, title: 'S-Trap protein capture', strap: 'PRECIPITATE AND TRAP', visual: 'trap',
    concept: 'Under acidified organic conditions, proteins precipitate and are retained in the S-Trap matrix while incompatible solutes are washed through.',
    observable: 'Protein particles collect at the porous trapping surface instead of leaving in the flow-through.',
    caution: 'The S-Trap does not identify or separate peptide sequences at this step.',
    action: 'Bind and wash', labels: ['Precipitated proteins', 'Porous matrix', 'Washed contaminants'],
  },
  {
    chapter: 0, title: 'On-trap proteolysis', strap: 'PROTEINS BECOME PEPTIDES', visual: 'digest',
    concept: 'Trypsin cleaves mainly after lysine and arginine, except where cleavage is hindered. Peptides are released and eluted.',
    observable: 'Long protein chains become multiple shorter peptide segments that leave the trap.',
    caution: 'Missed cleavages, modified residues and non-specific cleavages are possible.',
    action: 'Digest and elute', labels: ['Protein substrate', 'Cleavage points', 'Eluted peptides'],
  },
  {
    chapter: 0, title: 'STAGE-tip desalting', strap: 'RETAIN, WASH, ELUTE', visual: 'cleanup',
    concept: 'Reverse-phase sorbent retains many peptides while salts are washed away; changing the solvent elutes the retained peptides.',
    observable: 'Cyan peptides are held in the tip, then move into a clean collection fraction.',
    caution: 'Peptide recovery depends on chemistry; extreme hydrophilicity or hydrophobicity can affect retention.',
    action: 'Elute clean peptides', labels: ['Peptide retention', 'Wash salts', 'Clean eluate'],
  },
  {
    chapter: 1, title: 'Vanquish Neo autosampler', strap: 'FROM VIAL TO FLUIDIC PATH', visual: 'pickup',
    concept: 'The autosampler draws a measured aliquot and transfers it into the LC flow path.',
    observable: 'A moving needle reaches the sample, aspirates fluid and routes it to either a trap or direct-injection path.',
    caution: 'Trap loading and direct injection are alternative configurations with different focusing and sample-loading implications.',
    action: 'Inject the sample', modes: ['Trap loading', 'Direct injection'],
    labels: ['Sample vial', 'Injection needle', 'LC transfer'],
  },
  {
    chapter: 1, title: 'NanoLC separation', strap: 'PEPTIDES SPREAD IN TIME', visual: 'lc',
    concept: 'A solvent gradient changes peptide retention on the analytical column, giving different elution times.',
    observable: 'Initially overlapping peptides separate into multiple time-resolved coloured bands.',
    caution: 'An LC trace is a time–signal plot; it is not itself a peptide identification.',
    action: 'Run the gradient', labels: ['Analytical column', 'Retention differences', 'Elution order'],
  },
  {
    chapter: 1, title: 'Electrospray ionisation', strap: 'DROPLETS TO GAS-PHASE IONS', visual: 'esi',
    concept: 'Electrospray produces charged droplets that shrink through desolvation and ultimately release gas-phase peptide ions.',
    observable: 'A dense fluid plume separates into colourful ions with different charge states.',
    caution: 'The ionisation drawing is schematic; charge-state distributions vary by peptide and conditions.',
    action: 'Form peptide ions', labels: ['Charged droplets', 'Desolvation', 'Multiply charged ions'],
  },
  {
    chapter: 1, title: 'MS1 precursor survey', strap: 'MEASURE PRECURSOR m/z', visual: 'ms1',
    concept: 'The instrument measures intact peptide ion m/z and relative signal before any selected precursor is fragmented.',
    observable: 'Colourful ions travel through the ion optics into the analyser; a precursor spectrum forms.',
    caution: 'Exploris 480, Astral and Eclipse have distinct ion paths and analysers. Geometry here is conceptual, not an engineering cutaway.',
    action: 'Acquire MS1', modes: ['Exploris 480', 'Orbitrap Astral', 'Orbitrap Eclipse'],
    labels: ['Ion optics', 'm/z measurement', 'Precursor spectrum'],
  },
  {
    chapter: 1, title: 'DDA versus DIA isolation', strap: 'WHICH IONS ENTER MS2?', visual: 'isolate',
    concept: 'DDA selects individual precursor features for fragmentation; DIA cycles predefined isolation windows containing many co-isolated precursors.',
    observable: 'DDA highlights one narrow selection. DIA moves multiple broad windows through the precursor range.',
    caution: 'DIA MS2 spectra are multiplexed. Fragment-to-precursor assignment requires chromatographic and statistical evidence.',
    action: 'Cycle isolation windows', modes: ['DDA', 'DIA'],
    labels: ['Precursor population', 'Isolation window', 'Selected ions'],
  },
  {
    chapter: 1, title: 'MS2 peptide fragmentation', strap: 'GENERATE SEQUENCE EVIDENCE', visual: 'fragment',
    concept: 'Collision-induced fragmentation yields sequence-informative ions, commonly b- and y-type fragments.',
    observable: 'A precursor breaks into coloured fragment families; the spectrum is a set of m/z peaks and intensities.',
    caution: 'Not every backbone bond fragments and not every peak is a b/y ion; noise and alternative fragments remain.',
    action: 'Fragment the precursor', labels: ['Isolated precursor', 'b/y ion series', 'MS2 spectrum'],
  },
  {
    chapter: 1, title: 'Eclipse TMT SPS-MS3', strap: 'REPORTER-ION MEASUREMENT', visual: 'ms3',
    concept: 'In an SPS-MS3 workflow, several MS2 fragments are co-isolated and fragmented again to quantify TMT reporter ions.',
    observable: 'Selected MS2 fragments feed an MS3 event, creating a compact channel-coded reporter-ion cluster.',
    caution: 'MS3 often reduces but does not abolish ratio interference. This route is specific to a configured Tribrid workflow.',
    action: 'Acquire SPS-MS3', labels: ['MS2 fragments', 'SPS selection', 'TMT reporters'],
  },
  {
    chapter: 2, title: 'Search a protein database', strap: 'SEQUENCES GENERATE CANDIDATES', visual: 'fasta',
    concept: 'A FASTA database is in silico digested to make candidate peptide sequences and theoretical fragment masses.',
    observable: 'Protein sequence strips split into possible peptides for comparison with observed spectra.',
    caution: 'A candidate match is not proof that the peptide exists. The database and modification search space influence sensitivity.',
    action: 'Generate candidates', labels: ['FASTA proteins', 'Enzyme cleavage', 'Candidate peptides'],
  },
  {
    chapter: 2, title: 'PSM scoring and target–decoy FDR', strap: 'HOW CERTAIN IS THE MATCH?', visual: 'psm',
    concept: 'Search engines score spectra against candidates. Target–decoy competition estimates the rate of false matches among accepted hits.',
    observable: 'Target matches concentrate above the score threshold while decoy hits reveal the expected false-match fraction.',
    caution: 'A 1% PSM FDR is a population-level estimate, not a 99% probability that each individual PSM is correct. PSM, peptide and protein FDR differ.',
    action: 'Set the FDR threshold', labels: ['Target matches', 'Decoy matches', 'Accepted PSMs'],
  },
  {
    chapter: 2, title: 'Peptide inference and protein roll-up', strap: 'FROM FRAGMENTS TO PROTEIN GROUPS', visual: 'protein',
    concept: 'Supported peptides are mapped to proteins; shared peptides cause ambiguity and may require protein-group inference.',
    observable: 'Peptide nodes form bridges to possible proteins, then unique peptides strengthen a selected protein group.',
    caution: 'Protein abundance summarisation is distinct from protein identification. Protein-level FDR requires its own control.',
    action: 'Infer protein groups', labels: ['Unique peptides', 'Shared peptides', 'Protein groups'],
  },
  {
    chapter: 3, title: 'DDA label-free quantitation', strap: 'ALIGN AND MEASURE ION SIGNAL', visual: 'lfq',
    concept: 'Feature detection, retention-time alignment and extracted ion chromatograms link quantified peptide signals across runs.',
    observable: 'Peptide XIC peaks are aligned and integrated, yielding a quantitative matrix before protein summarisation.',
    caution: 'Missing features and co-elution can bias intensity. LFQ-Analyst consumes quantified upstream exports; it is not a search engine.',
    action: 'Align peptide features', labels: ['Run A / Run B', 'XIC integration', 'Protein summaries'],
  },
  {
    chapter: 3, title: 'DIA peptide-centric quantitation', strap: 'EXTRACT FRAGMENT CHROMATOGRAMS', visual: 'dia',
    concept: 'DIA-NN and Spectronaut use fragment traces, retention evidence and interference scoring to infer and quantify peptide precursors.',
    observable: 'Co-eluting coloured fragment traces assemble into a scored precursor signal across DIA windows.',
    caution: 'Library-based and library-free strategies differ; sequence-centric searches propose sequences, while peptide-centric extraction tests defined hypotheses. Control identification FDR separately from differential-testing FDR.',
    action: 'Extract and score traces', modes: ['DIA-NN', 'Spectronaut'],
    labels: ['Fragment traces', 'Co-elution', 'Precursor quantity'],
  },
  {
    chapter: 3, title: 'TMT reporter-ion quantitation', strap: 'READ CHANNEL RATIOS', visual: 'tmt',
    concept: 'Reporter-ion intensities encode relative abundance across multiplexed channels after isotopic impurity correction and interference evaluation.',
    observable: 'Ten coloured reporter bars rise at their channel-specific masses and form a sample-by-peptide matrix.',
    caution: 'Channel bleed, co-isolation interference, low signal and unequal loading must be assessed before protein-level tests.',
    action: 'Quantify reporter channels', labels: ['Reporter cluster', 'Channel intensities', 'Relative ratios'],
  },
  {
    chapter: 3, title: 'Statistics in the Analyst suite', strap: 'FROM MATRIX TO INTERPRETATION', visual: 'statistics',
    concept: 'DIA-Analyst, LFQ-Analyst and TMT-Analyst use upstream intensities for QC, normalisation, study-design contrasts, enrichment and visual summaries.',
    observable: 'A feature matrix becomes PCA, intensity diagnostics and a volcano-style effect-size versus significance view.',
    caution: 'Differential-testing adjusted p-values control multiple hypothesis tests; they are not identification q-values. Never interpret these simulated points as experimental results.',
    action: 'Run an example contrast', modes: ['DIA-Analyst', 'LFQ-Analyst', 'TMT-Analyst'],
    labels: ['QC / PCA', 'Statistical contrast', 'Adjusted p-values'],
  },
] as const;

export function chapterFirst(index: number): number {
  const pos = STAGES.findIndex(s => s.chapter === index);
  return pos < 0 ? 0 : pos;
}

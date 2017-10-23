import React from 'react';

const Downloads = () => (
  <div>
    <h1>Downloads</h1>

    <h2>FoldX Data</h2>
    <ol>
      <li>
        <a href="/foldx-results-all.zip">foldx-results-all.zip</a>&mdash;All
        of the foldx data. (39G, sha256sum: )
      </li>
      <li>
        <a href="/foldx-results-P17.zip">foldx-results-P17.zip</a>&mdash;The
        foldx data for P17 only.
      </li>
      <li>
        TODO: complete this list.
      </li>
    </ol>

    <h2>Protein Data</h2>
    <p>Protein data comes in 3 forms: </p>
    <ol>
      <li>
        Epitope Summaries (csv): /[PROTEIN]-epitope_summaries.csv,
        <a href="/P17-epitope_summaries.csv">Example</a>
      </li>
      <li>
        Site Entropies (csv): /[PROTEIN]-site_entropies.csv,
        <a href="/P17-site_entropies.csv">Example</a>
      </li>
      <li>
        JSON Output (both of the above combined): /[PROTEIN],
        <a href="/P17">Example</a>
      </li>
    </ol>

    <h2>Source Code and Other Repositories</h2>
    <ol>
      <li>TBD
      </li>
      <li>TBD
      </li>
      <li>TBD
      </li>
      </ol>
  </div>
)


export default Downloads;

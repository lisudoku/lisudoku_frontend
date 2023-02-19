import _ from 'lodash'
import { Link } from 'react-router-dom'
import ExternalLink from 'src/components/ExternalLink'
import { StepRule } from 'src/types/wasm'
import { StepRuleDifficulty, StepRuleDisplay } from 'src/utils/constants'
import { Technique } from './types'

const HOUSE = <ExternalLink url="https://www.sudopedia.org/wiki/House">house</ExternalLink>

const LinkToTechnique = ({ id }: { id: StepRule }) => (
  <Link to={`/learn#${id}`}>{StepRuleDisplay[id]}</Link>
)

const TECHNIQUES: Technique[] = [
  {
    id: StepRule.HiddenSingle,
    akas: [ 'Last Remaining Cell', 'Pinned Digit' ],
    summary: <>
      In a row/column/box (or any {HOUSE}) you can only put digit X in only one of the cells, so put it there.
    </>,
    externalResources: [
      {
        name: 'sudoku.com',
        url: 'https://sudoku.com/sudoku-rules/hidden-singles',
      },
      {
        name: 'sudokuwiki.org',
        url: 'https://www.sudokuwiki.org/Getting_Started',
      },
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/Hidden_Single',
      },
    ],
    practicePuzzleIds: [ 'EieojFK9AdYIi-a6rgDc', 'vmZ4ApDalmLPZWeAF46n' ],
  },
  {
    id: StepRule.NakedSingle,
    akas: [ 'Obvious Single', 'The Last Possible Number', 'Forced Digit', 'Sole Candidate' ],
    summary: 'A cell has only one possible digit, so write it in.',
    externalResources: [
      {
        name: 'sudoku.com',
        url: 'https://sudoku.com/sudoku-rules/obvious-singles',
      },
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/Naked_Single',
      },
      {
        name: 'sudokuwiki.org',
        url: 'https://www.sudokuwiki.org/Naked_Candidates',
      },
    ],
    practicePuzzleIds: [ 'nF4pF8Orna9Oi-0uPE-0', 'DwbYLJrG7EHbCA0jEzFj' ],
  },
  {
    id: StepRule.Candidates,
    akas: [ 'Pencil marks', 'Notes' ],
    summary: 'Write all the possible values in each cell.',
    externalResources: [
      {
        name: 'sudoku.com',
        url: 'https://sudoku.com/sudoku-rules/notes-in-sudoku',
      },
    ],
  },
  {
    id: StepRule.HiddenPairs,
    akas: [ 'Last 2 Remaining Cells' ],
    summary: <>
      In a row/column/box (or any {HOUSE}) you can only put digits X and Y in two of the cells, 
      so remove every other candidate from those two cells.
    </>,
    externalResources: [
      {
        name: 'sudoku.com',
        url: 'https://sudoku.com/sudoku-rules/hidden-pairs',
      },
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/Hidden_Pair',
      },
      {
        name: 'sudokuwiki.org',
        url: 'https://www.sudokuwiki.org/Hidden_Candidates',
      },
    ],
    practicePuzzleIds: [ 'GxTywFE7fBXPGskVg7D5', 'bHjg-8DIkr4IqljiFeQ5' ],
  },
  {
    id: StepRule.NakedPairs,
    akas: [ 'Obvious Pairs' ],
    summary: <>
      In a row/column/box (or any {HOUSE}) two cells can only contain digits X and Y, so you can remove them
      as candidates from every other cell in the same house.
    </>,
    externalResources: [
      {
        name: 'sudoku.com',
        url: 'https://sudoku.com/sudoku-rules/obvious-pairs',
      },
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/Naked_Pair',
      },
      {
        name: 'sudokuwiki.org',
        url: 'https://www.sudokuwiki.org/Naked_Candidates',
      },
    ],
    practicePuzzleIds: [ '4_zKMu9oIek4v4BYDaYK', '0ia3B_nKWJnnFXm-6Tfg' ],
  },
  {
    id: StepRule.LockedCandidatesPairs,
    akas: [ 'Intersection Removal', 'Line-Box Interaction', 'Pointing Pairs', 'Claiming/Box-Line Reduction' ],
    summary: <>
      In a row/column/box A, there are two candidate cells for digit X. If there is another
      row/column/box B that contains those two cells, remove X as a candidate from all other cells in B.<br />
      Example: In column 3, digit 3 must be in box 1. Therefore, 3 cannot be a candidate of any
      other cell in the same box.
    </>,
    externalResources: [
      {
        name: 'sudoku.com',
        url: 'https://sudoku.com/sudoku-rules/pointing-pairs',
      },
      {
        name: 'sudokuwiki.org',
        url: 'https://www.sudokuwiki.org/Intersection_Removal',
      },
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/Locked_Candidates',
      },
    ],
    practicePuzzleIds: [ '9glG1HW6b_anCo2nNKS7', '0km-feHHbCzUtT7cgJI4', '0kncvSKSbAFIUWCWfDF5', 'QwA-W4OAZBU3NF6VnKzX' ],
  },
  {
    id: StepRule.HiddenTriples,
    akas: [ 'Last 3 Remaining Cells' ],
    summary: <>
      In a row/column/box (or any {HOUSE}) you can only put digits X, Y and Z in three of the cells, 
      so remove every other candidate from those three cells.
    </>,
    externalResources: [
      {
        name: 'sudoku.com',
        url: 'https://sudoku.com/sudoku-rules/hidden-triples',
      },
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/Hidden_Triple',
      },
      {
        name: 'sudokuwiki.org',
        url: 'https://www.sudokuwiki.org/Hidden_Candidates',
      },
    ],
    practicePuzzleIds: [ 'r1fjs-dBjm8ZPXbE7fPg' ],
  },
  {
    id: StepRule.NakedTriples,
    akas: [ 'Obvious Triples' ],
    summary: <>
      In a row/column/box (or any {HOUSE}) three cells can only contain digits X, Y and Z, so you can 
      remove them as candidates from every other cell in the same house.
    </>,
    externalResources: [
      {
        name: 'sudoku.com',
        url: 'https://sudoku.com/sudoku-rules/obvious-triples',
      },
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/Naked_Triple',
      },
      {
        name: 'sudokuwiki.org',
        url: 'https://www.sudokuwiki.org/Naked_Candidates',
      },
    ],
    practicePuzzleIds: [ 'tduyFLYnpdgGN1JD-9hE', 'V_uw0INLBbl8erdXXoaz' ],
  },
  {
    id: StepRule.LockedCandidatesTriples,
    akas: [ 'Intersection Removal', 'Line-Box Interaction', 'Pointing Pairs', 'Claiming/Box-Line Reduction' ],
    summary: <>
      In a row/column/box A, there are three candidate cells for digit X. If there is another
      row/column/box B that contains those three cells, remove X as a candidate from all other cells in B.
      <br/>
      Example: In column 3, digit 3 must be in box 1. Therefore, 3 cannot be a candidate of any
      other cell in the same box.
    </>,
    externalResources: [
      {
        name: 'sudoku.com',
        url: 'https://sudoku.com/sudoku-rules/pointing-triples',
      },
      {
        name: 'sudokuwiki.org',
        url: 'https://www.sudokuwiki.org/Intersection_Removal',
      },
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/Locked_Candidates',
      },
    ],
    practicePuzzleIds: [ 'o2vQ_rNgcAq55N8S4btx' ],
  },
  {
    id: StepRule.CommonPeerElimination,
    summary: <>
      Putting digit X in a cell eliminates X as a candidate from another {HOUSE}, 
      so it's not a valid candidate for that cell.
      <br />
      This technique is the general version of <LinkToTechnique id={StepRule.LockedCandidatesPairs} />.

      It is more common in variants like Anti Knight and Diagonal 
      because Classic has more specialized techniques.
    </>,
    externalResources: [
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/Common_Peer_Elimination',
      },
    ],
    practicePuzzleIds: [ '14FeIMjH-nu0fHvYWBUd', 'A_WvQ-kOkByeH1UeP5Ry', 'st6h2L23wpISdgeQC27a' ],
  },
  {
    id: StepRule.XWing,
    summary: <>
      Find rows where digit X is a candidate in only two cells. If there is a pair of rows 
      where the cells are in the same two columns, remove X as a candidate from all other
      cells in those columns.
      <br />
      It also works the other way around (columns and rows).
    </>,
    externalResources: [
      {
        name: 'sudoku.com',
        url: 'https://sudoku.com/sudoku-rules/h-wing',
      },
      {
        name: 'sudokuwiki.org',
        url: 'https://www.sudokuwiki.org/X_Wing_Strategy',
      },
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/X-Wing',
      },
    ],
    practicePuzzleIds: [ 'yIqroHNVqFVQIxvihKYa', 'p2sm-XRlR1M-tNxEfYT1' ],
  },
  {
    id: StepRule.XYWing,
    akas: [ 'Y-Wing', 'Bent Triples' ],
    summary: <>
      Cell with candidates XY sees two cells with candidates XZ and YZ. 
      Remove Z as a candidate from every cell that sees both cells XZ and YZ.
    </>,
    externalResources: [
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/XY-Wing',
      },
      {
        name: 'sudokuwiki.org',
        url: 'https://www.sudokuwiki.org/Y_Wing_Strategy',
      },
    ],
    practicePuzzleIds: [ 'DuujC8eA4PiPKDYTn5hX' ]
  },
  {
    id: StepRule.Thermo,
    summary: <>
      Only applies to Thermo puzzles.
      <br/>
      For a thermometer, starting from the bulb and going to the ending cell, 
      find the smallest digit that can be a candidate in each cell.
      <br/>
      Do the same thing starting at the end and going towards the bulb and find the highest digits.
      <br/>
      If you find a cell where the lowest digit is also the highest you can fill it in.
    </>,
    practicePuzzleIds: [ 'QpWV8gGnJ3bDSfVboe6n' ],
  },
  {
    id: StepRule.ThermoCandidates,
    summary: <>
      Only applies to Thermo puzzles.
      <br/>
      Same as <LinkToTechnique id={StepRule.Thermo} />, but we use it to remove candidates. You can 
      remove any candidates from a cell that are not between the lowest and the highest valid candidate.
      <br />
      Example: The bulb cell has candidates 2,3. The next cell has candidates 2,3,5 and you can remove 2.
    </>,
    practicePuzzleIds: [ 'ZiKD2zQKk97LamntZ32w' ],
  },
  {
    id: StepRule.Kropki,
    summary: <>
      Only applies to Kropki puzzles.
      <br/>
      For a kropki dot, find all valid digit combinations in the corresponding pair of cells. 
      Remove all candidate digits that do not appear in any combination.
    </>,
    practicePuzzleIds: [ 'LlBlSN4rx4NZ1mfruv4n' ],
  },
  {
    id: StepRule.KropkiChainCandidates,
    summary: <>
      Only applies to Kropki puzzles.
      <br/>
      Same as <LinkToTechnique id={StepRule.Kropki} />, but apply for a chain of cells 
      linked by dots in the same {HOUSE}.
    </>,
    practicePuzzleIds: [ 'rGhrOQVXJS7LiV4VpRm2' ],
  },
  {
    id: StepRule.CommonPeerEliminationKropki,
    summary: <>
      Only applies to Kropki puzzles. 
      It is a combination of <LinkToTechnique id={StepRule.CommonPeerElimination} /> and 
      {' '}<LinkToTechnique id={StepRule.KropkiChainCandidates} />.
      <br/>
      If one chain combination eliminates all candidates from a cell that the entire chain sees, 
      remove the combination as a candidate.
    </>,
    practicePuzzleIds: [ 'F2mvNvtEFlNrEkGK-5fG', '4rWU4qvNQNH02XsKFrPY' ],
  },
  {
    id: StepRule.KillerCandidates,
    akas: [ 'Sum Elimination' ],
    summary: <>
      Only applies to Killer puzzles.
      <br/>
      For a killer cage, find all digit combinations that satisfy the sum. 
      Remove all candidate digits that do not appear in any combination.
    </>,
    externalResources: [
      {
        name: 'killersudokuonline.com (Sum Elimination)',
        url: 'https://www.killersudokuonline.com/tips.html',
      },
    ],
    practicePuzzleIds: [ '76ilIbjv_xxEEoeI6p1l' ],
  },
  {
    id: StepRule.Killer45,
    akas: [ 'Rule of 45' ],
    summary: <>
      Only applies to Killer puzzles.
      <br/>
      The sum of digits in a 9 cell {HOUSE} is 1+2+...+9 = 45.
      <br/>
      Starting with 45, you can subtract all of the cage sums that are fully within the same house and 
      you get the sum of the rest of the cells. If there is only one cell left, you found the value of that cell.
      <br/>
      For other house sizes use a different 1+2+...+n.
    </>,
    externalResources: [
      {
        name: 'killersudokuonline.com (Rule of 45)',
        url: 'https://www.killersudokuonline.com/tips.html',
      },
    ],
    practicePuzzleIds: [ 'rkwWa3AEg_lMValqbdDp' ],
  },
  {
    id: StepRule.TurbotFish,
    summary: <>
      For a digit X there are 2 strong links (A-B, C-D) and one of their ends see each other
      (let's assume they are A and B).
      You can remove X as a candidate from all cells that see both C and D.
      <br/>
      There are 3 subtypes of Turbot Fish: Skyscrapers, 2-String Kites and Empty Rectangles.
      <br/>
      A Turbot Fish in a particular type of X-Cycle.
    </>,
    externalResources: [
      {
        name: 'sudopedia.org',
        url: 'https://www.sudopedia.org/wiki/Turbot_Fish',
      },
    ],
    practicePuzzleIds: [ '_Zm0aj0rpHD8tCYTCdZU' ],
  },
]

export const TECHNIQUES_BY_DIFFICULTY = _.groupBy(
  TECHNIQUES, technique => StepRuleDifficulty[technique.id]
)

import { ConstraintType } from 'src/types/sudoku'
import { ConstraintDefinition } from './types'
import { regionsConstraint } from './regions/regions'
import { fixedNumberConstraint } from './fixed_number/fixed_number'
import { thermoConstraint } from './thermo/thermo'
import { primaryDiagonalConstraint } from './diagonal/primary_diagonal'
import { secondaryDiagonalConstraint } from './diagonal/secondary_diagonal'
import { extraRegionsConstraint } from './extra_regions/extra_regions'
import { arrowConstraint } from './arrow/arrow'
import { renbanConstraint } from './renban/renban'
import { palindromeConstraint } from './palindrome/palindrome'
import { antiKnightConstraint } from './anti_knight/anti_knight'
import { antiKingConstraint } from './anti_king/anti_king'
import { killerCageConstraint } from './killer_cage/killer_cage'
import { kropkiConsecutiveConstraint } from './kropki/kropki_consecutive'
import { kropkiDoubleConstraint } from './kropki/kropki_double'
import { kropkiNegativeConstraint } from './kropki/kropki_negative'
import { oddConstraint } from './odd_even/odd'
import { evenConstraint } from './odd_even/even'
import { topBottomConstraint } from './top_bottom/top_bottom'

export const constraintDefinitions: Record<ConstraintType, ConstraintDefinition> = {
  [ConstraintType.FixedNumber]: fixedNumberConstraint,
  [ConstraintType.Regions]: regionsConstraint,
  [ConstraintType.Thermo]: thermoConstraint,
  [ConstraintType.ExtraRegions]: extraRegionsConstraint,
  [ConstraintType.PrimaryDiagonal]: primaryDiagonalConstraint,
  [ConstraintType.SecondaryDiagonal]: secondaryDiagonalConstraint,
  [ConstraintType.Arrow]: arrowConstraint,
  [ConstraintType.Renban]: renbanConstraint,
  [ConstraintType.Palindrome]: palindromeConstraint,
  [ConstraintType.AntiKnight]: antiKnightConstraint,
  [ConstraintType.AntiKing]: antiKingConstraint,
  [ConstraintType.KillerCage]: killerCageConstraint,
  [ConstraintType.KropkiConsecutive]: kropkiConsecutiveConstraint,
  [ConstraintType.KropkiDouble]: kropkiDoubleConstraint,
  [ConstraintType.KropkiNegative]: kropkiNegativeConstraint,
  [ConstraintType.Odd]: oddConstraint,
  [ConstraintType.Even]: evenConstraint,
  [ConstraintType.TopBottom]: topBottomConstraint,
}

import type { Question, QuestionCategory } from '../types/questions';
import { Confetti } from './Confetti';
import { CongratsPanel } from './CongratsPanel';
import { Header } from './Header';
import { QuestionArea } from './QuestionArea';
import { SkipQuestionModal } from './SkipQuestionModal';

type QuestionScreenProps = {
  statusMessage: string;
  activeFilterSummary: string;
  onEnd: () => void;
  shouldShowCongrats: boolean;
  allQuestionsPlayed: boolean;
  activeCategories: QuestionCategory[];
  playAgainLabel: string;
  onPlayAgain: () => void;
  question?: Question;
  index?: number;
  total: number;
  onShuffle: () => void;
  onBack: () => void;
  onSkip: () => void;
  onForward: () => void;
  hint?: string;
  disableShuffle?: boolean;
  showSkip?: boolean;
  showBack?: boolean;
  showForward?: boolean;
  isSkipModalOpen: boolean;
  onSkipForSession: () => void;
  onSkipPermanently: () => void;
  onCloseSkipModal: () => void;
};

export function QuestionScreen({
  statusMessage,
  activeFilterSummary,
  onEnd,
  shouldShowCongrats,
  allQuestionsPlayed,
  activeCategories,
  playAgainLabel,
  onPlayAgain,
  question,
  index,
  total,
  onShuffle,
  onBack,
  onSkip,
  onForward,
  hint,
  disableShuffle,
  showSkip,
  showBack,
  showForward,
  isSkipModalOpen,
  onSkipForSession,
  onSkipPermanently,
  onCloseSkipModal,
}: QuestionScreenProps) {
  const congratsPanel = (
    <CongratsPanel
      activeCategories={activeCategories}
      allQuestionsPlayed={allQuestionsPlayed}
      playAgainLabel={playAgainLabel}
      onPlayAgain={onPlayAgain}
    />
  );

  return (
    <>
      <Header title="Love Shuffle" status={statusMessage} filterSummary={activeFilterSummary} onEnd={onEnd} />
      {shouldShowCongrats && !question ? (
        <div className="question-area" style={{ position: 'relative' }} data-testid="all-played-view">
          {congratsPanel}
          <Confetti />
        </div>
      ) : (
        <div className="question-area" style={{ position: 'relative' }} data-testid={shouldShowCongrats ? 'all-played-view' : 'question-flow-view'}>
          <QuestionArea
            question={question}
            index={index}
            total={total}
            onShuffle={onShuffle}
            onBack={onBack}
            onSkip={onSkip}
            onForward={onForward}
            hint={hint}
            disableShuffle={disableShuffle}
            showSkip={showSkip}
            showBack={showBack}
            showForward={showForward}
          />

          {shouldShowCongrats && (
            <>
              {congratsPanel}
              <Confetti />
            </>
          )}
        </div>
      )}
      <SkipQuestionModal
        isOpen={isSkipModalOpen}
        onSkipForSession={onSkipForSession}
        onSkipPermanently={onSkipPermanently}
        onClose={onCloseSkipModal}
      />
    </>
  );
}

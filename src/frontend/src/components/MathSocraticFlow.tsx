import type React from "react";
import type { MathQuestion } from "../lib/mathEngine";
import MathMethodDisplay from "./MathMethodDisplay";

interface MathSocraticFlowProps {
  question: string;
  mathData: MathQuestion;
}

const MathSocraticFlow: React.FC<MathSocraticFlowProps> = ({ mathData }) => {
  return (
    <div className="animate-slide-up">
      <MathMethodDisplay mathData={mathData} />
    </div>
  );
};

export default MathSocraticFlow;

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

interface PredictionResult {
  name: string;
  confidence: number;
}

interface ConfidenceDisplayProps {
  predictions: PredictionResult[];
  className?: string;
}

export const ConfidenceDisplay = ({ predictions, className = "" }: ConfidenceDisplayProps) => {
  if (!predictions || predictions.length === 0) {
    return null;
  }

  // Sort predictions by confidence and take top 3
  const topPredictions = predictions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  // Hide confidence comparison if top prediction is "Not a medicine"
  if (topPredictions.length > 0 && topPredictions[0].name.toLowerCase() === "not a medicine") {
    return null;
  }

  return (
    <Card className={`glass-card p-4 sm:p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold">Confidence Comparison</h3>
      </div>
      
      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
        Top 3 possible matches with probabilities:
      </p>

      <div className="space-y-3">
        {/* Header */}
        <div className="grid grid-cols-2 gap-4 pb-2 border-b border-border">
          <div className="text-xs sm:text-sm font-medium text-muted-foreground">
            Prediction
          </div>
          <div className="text-xs sm:text-sm font-medium text-muted-foreground text-right">
            Confidence
          </div>
        </div>

        {/* Predictions */}
        {topPredictions.map((prediction, index) => (
          <div 
            key={index}
            className="grid grid-cols-2 gap-4 py-2 hover:bg-accent/50 rounded-md transition-colors"
          >
            <div className="flex items-center gap-2">
              {index === 0 && (
                <Badge variant="default" className="text-xs px-1.5 py-0.5">
                  Top
                </Badge>
              )}
              <span className="text-sm sm:text-base font-medium">
                {prediction.name}
              </span>
            </div>
            <div className="text-right">
              <span 
                className={`text-sm sm:text-base font-semibold ${
                  index === 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-muted-foreground'
                }`}
              >
                {prediction.confidence}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bars for visual representation */}
      <div className="mt-4 space-y-2">
        {topPredictions.map((prediction, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{prediction.name}</span>
              <span>{prediction.confidence}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5 sm:h-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  index === 0
                    ? 'bg-green-500'
                    : index === 1
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                }`}
                style={{ width: `${prediction.confidence}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface UnknownMedicineCardProps {
  error: {
    type: 'low_confidence' | 'not_found' | 'general';
    message: string;
    suggestion?: string;
    confidence?: number;
    medicineName?: string;
  };
  onRetry: () => void;
}

export const UnknownMedicineCard = ({ error, onRetry }: UnknownMedicineCardProps) => {
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSendFeedback = () => {
    // In a real app, this would send feedback to your backend
    // For now, we'll just show a success message
    setFeedbackSent(true);
    toast.success("Thank you! Your feedback helps us improve our medicine database.");
  };

  const getErrorIcon = () => {
    switch (error.type) {
      case 'not_found':
        return <AlertTriangle className="h-8 w-8 text-orange-500" />;
      case 'low_confidence':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }
  };

  const getTitle = () => {
    switch (error.type) {
      case 'not_found':
        return "Medicine Not Found";
      case 'low_confidence':
        return "Low Confidence Detection";
      default:
        return "Scan Error";
    }
  };

  const getDescription = () => {
    switch (error.type) {
      case 'not_found':
        return `We couldn't find "${error.medicineName}" in our current database of 25+ medicines. This medicine might not be supported yet.`;
      case 'low_confidence':
        return `We detected "${error.medicineName}" but with low confidence (${error.confidence}%). We require at least 70% confidence for accurate identification.`;
      default:
        return error.message;
    }
  };

  const getSuggestions = () => {
    switch (error.type) {
      case 'not_found':
        return [
          "Try scanning a different medicine from our supported list",
          "Ensure you're scanning tablets or capsules only",
          "Check if the medicine is commonly available",
          "Send us feedback to add this medicine to our database"
        ];
      case 'low_confidence':
        return [
          "Improve lighting - avoid shadows and reflections",
          "Scan individual tablets/capsules, not bottles",
          "Keep the camera steady and in focus",
          "Try a cleaner background (white paper works well)",
          "Ensure the medicine fills most of the frame"
        ];
      default:
        return [
          "Check your internet connection",
          "Try scanning again",
          "Restart the app if the problem persists"
        ];
    }
  };

  return (
    <Card className="glass-card p-6">
      <div className="text-center space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          {getErrorIcon()}
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{getTitle()}</h3>
          <p className="text-sm text-muted-foreground">
            {getDescription()}
          </p>
        </div>

        {/* Suggestions */}
        <div className="text-left space-y-2">
          <h4 className="text-sm font-medium">💡 Suggestions:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {getSuggestions().map((suggestion, index) => (
              <li key={index}>• {suggestion}</li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button 
            onClick={onRetry}
            className="medical-gradient text-white"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          {error.type === 'not_found' && !feedbackSent && (
            <Button 
              onClick={handleSendFeedback}
              variant="outline"
              size="sm"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Request This Medicine
            </Button>
          )}

          {feedbackSent && (
            <p className="text-xs text-green-600 mt-2">
              ✓ Feedback sent! We'll consider adding this medicine.
            </p>
          )}
        </div>

        {/* Beta Notice */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Beta Version:</strong> We're continuously expanding our medicine database. 
            Your feedback helps us prioritize which medicines to add next.
          </p>
        </div>
      </div>
    </Card>
  );
};

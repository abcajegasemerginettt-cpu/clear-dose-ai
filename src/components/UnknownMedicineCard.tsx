import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, RotateCcw, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import emailjs from '@emailjs/browser';

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
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendFeedback = async () => {
    if (!medicineName.trim()) {
      toast.error("Please enter the medicine name.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // EmailJS Configuration - Replace with your actual keys
      const emailjsConfig = {
        serviceId: 'service_l3gpipl', // Replace with your Gmail service ID
        templateId: 'template_vdqo4yn', // Replace with your template ID  
        publicKey: '_Ouucfc8b2QR8VZiX' // Replace with your public key
      };

      // Send email via EmailJS
      const emailParams = {
        medicine_name: medicineName,
        error_type: error.type === 'not_found' ? 'Medicine Not in Database' : 'Low Confidence Detection',
        confidence: error.confidence || 0,
        timestamp: new Date().toLocaleString(),
        user_message: userMessage || 'No additional message provided'
      };

      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        emailParams,
        emailjsConfig.publicKey
      );

      // Also store in database for backup
      await supabase.from('scan_history').insert({
        medicine_name: `FEEDBACK: ${medicineName}`,
        confidence: error.confidence || 0,
        scanned_image_url: null,
      });

      setFeedbackSent(true);
      setShowRequestForm(false);
      toast.success("Medicine request sent successfully! We'll review it soon.");
      
    } catch (error) {
      console.error('Error sending feedback:', error);
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
        return "Medicine Not Found";
      default:
        return "Scan Error";
    }
  };

  const getDescription = () => {
    switch (error.type) {
      case 'not_found':
        return `We couldn't find "${error.medicineName}" in our current database of 25+ medicines. This medicine might not be supported yet.`;
      case 'low_confidence':
        return `This medicine is not currently supported by our AI model. We need to train our system to recognize this specific medicine for accurate identification.`;
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
          "This medicine needs to be added to our training model",
          "Try scanning a different medicine",
          "Request us to train this medicine in our AI model"
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
          {!feedbackSent && !showRequestForm && (
            <Button 
              onClick={() => setShowRequestForm(true)}
              variant="outline"
              size="sm"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Request This Medicine
            </Button>
          )}

          {/* Medicine Request Form */}
          {showRequestForm && !feedbackSent && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Request Medicine</h4>
                <Button
                  onClick={() => setShowRequestForm(false)}
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Medicine Name *
                  </label>
                  <Input
                    placeholder="Enter the exact medicine name"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Additional Information (Optional)
                  </label>
                  <Textarea
                    placeholder="Any additional details about this medicine..."
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    className="mt-1 h-20"
                  />
                </div>
                
                <Button
                  onClick={handleSendFeedback}
                  disabled={isSubmitting || !medicineName.trim()}
                  className="w-full"
                  size="sm"
                >
                  {isSubmitting ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </div>
          )}

          {feedbackSent && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-xs text-green-700 dark:text-green-300">
                ✓ Medicine request sent successfully! We'll review and consider adding it to our database.
              </p>
            </div>
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

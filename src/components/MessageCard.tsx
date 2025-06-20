
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare } from 'lucide-react';

interface MessageCardProps {
  message: string;
  onChange: (message: string) => void;
  className?: string;
}

const MessageCard = ({ message, onChange, className }: MessageCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={18} className="text-primary" />
          <h3 className="font-medium">Gift Message</h3>
        </div>
        
        <Label htmlFor="giftMessage" className="text-sm text-muted-foreground mb-2 block">
          Add a personal message to include with your gift (optional)
        </Label>
        
        <Textarea
          id="giftMessage"
          placeholder="Write your message here..."
          value={message}
          onChange={(e) => onChange(e.target.value)}
          className="resize-none min-h-[100px]"
        />
        
        <p className="mt-2 text-xs text-muted-foreground">
          This message will be printed on a card and included with your gift.
        </p>
      </CardContent>
    </Card>
  );
};

export default MessageCard;

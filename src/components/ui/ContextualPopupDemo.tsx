import React, { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { 
  EnhancedContextualPopup,
  ContextualPopupHeader,
  ContextualPopupFooter,
  ContextualPopupTitle,
  ContextualPopupDescription,
} from './enhanced-contextual-popup';
import { 
  Info, 
  Settings, 
  User, 
  Bell, 
  HelpCircle, 
  MoreHorizontal,
  Edit,
  Trash,
  Copy,
  Share
} from 'lucide-react';

const ContextualPopupDemo: React.FC = () => {
  const [controlledOpen, setControlledOpen] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Contextual Popup Demo</h1>
        <p className="text-muted-foreground">
          These popups appear contextually near their trigger elements and automatically adjust position based on available space.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info Popup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Basic Info Popup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click the button to see a contextual popup that appears near the trigger.
            </p>
            <EnhancedContextualPopup
              trigger={
                <Button variant="outline" className="w-full">
                  Show Info
                </Button>
              }
              variant="default"
            >
              <ContextualPopupHeader>
                <ContextualPopupTitle>Information</ContextualPopupTitle>
                <ContextualPopupDescription>
                  This popup appears contextually near the trigger button.
                </ContextualPopupDescription>
              </ContextualPopupHeader>
              <div className="mt-4">
                <p className="text-sm">
                  The popup automatically positions itself to stay within the viewport bounds.
                  If there's not enough space below, it appears above. If there's not enough
                  space on the sides, it adjusts its alignment.
                </p>
              </div>
              <ContextualPopupFooter>
                <Button size="sm">Got it</Button>
              </ContextualPopupFooter>
            </EnhancedContextualPopup>
          </CardContent>
        </Card>

        {/* Settings Popup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings Popup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A more complex popup with multiple options and actions.
            </p>
            <EnhancedContextualPopup
              trigger={
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              }
              variant="popup"
            >
              <div className="p-6">
                <ContextualPopupHeader>
                  <ContextualPopupTitle>Quick Settings</ContextualPopupTitle>
                  <ContextualPopupDescription>
                    Configure your preferences
                  </ContextualPopupDescription>
                </ContextualPopupHeader>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notifications</span>
                    <Badge variant="secondary">On</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dark Mode</span>
                    <Badge variant="outline">Off</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-save</span>
                    <Badge variant="secondary">On</Badge>
                  </div>
                </div>

                <ContextualPopupFooter className="mt-6">
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button size="sm">Save Changes</Button>
                </ContextualPopupFooter>
              </div>
            </EnhancedContextualPopup>
          </CardContent>
        </Card>

        {/* User Actions Popup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Popup with action buttons and different positioning.
            </p>
            <EnhancedContextualPopup
              trigger={
                <Button variant="outline" className="w-full">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions
                </Button>
              }
              variant="default"
            >
              <ContextualPopupHeader>
                <ContextualPopupTitle>User Actions</ContextualPopupTitle>
                <ContextualPopupDescription>
                  Choose an action to perform
                </ContextualPopupDescription>
              </ContextualPopupHeader>
              
              <div className="mt-4 space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </EnhancedContextualPopup>
          </CardContent>
        </Card>

        {/* Controlled Popup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Controlled Popup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A popup with controlled state management.
            </p>
            <EnhancedContextualPopup
              trigger={
                <Button variant="outline" className="w-full">
                  Controlled
                </Button>
              }
              isOpen={controlledOpen}
              onOpenChange={setControlledOpen}
              variant="default"
            >
              <ContextualPopupHeader>
                <ContextualPopupTitle>Controlled State</ContextualPopupTitle>
                <ContextualPopupDescription>
                  This popup uses controlled state management.
                </ContextualPopupDescription>
              </ContextualPopupHeader>
              
              <div className="mt-4">
                <p className="text-sm mb-4">
                  The open state is managed externally, allowing for more complex interactions.
                </p>
                <Button 
                  size="sm" 
                  onClick={() => setControlledOpen(false)}
                  className="w-full"
                >
                  Close Popup
                </Button>
              </div>
            </EnhancedContextualPopup>
          </CardContent>
        </Card>

        {/* Help Popup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Help Popup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A help popup with longer content to test scrolling.
            </p>
            <EnhancedContextualPopup
              trigger={
                <Button variant="outline" className="w-full">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </Button>
              }
              variant="default"
            >
              <ContextualPopupHeader>
                <ContextualPopupTitle>Help & Support</ContextualPopupTitle>
                <ContextualPopupDescription>
                  Get help with using the application
                </ContextualPopupDescription>
              </ContextualPopupHeader>
              
              <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                <div>
                  <h4 className="font-medium text-sm">How to use contextual popups:</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Contextual popups automatically position themselves near their trigger elements.
                    They intelligently choose the best side (top, bottom, left, right) based on
                    available space in the viewport.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm">Key Features:</h4>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• Automatic positioning based on available space</li>
                    <li>• Responsive design that works on all screen sizes</li>
                    <li>• Smooth animations and transitions</li>
                    <li>• Background scroll prevention</li>
                    <li>• Keyboard navigation support (Escape to close)</li>
                    <li>• Click outside to close functionality</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm">Best Practices:</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use contextual popups for quick actions, information display, or
                    contextual menus. They work best when the content is concise and
                    the interaction is quick.
                  </p>
                </div>
              </div>

              <ContextualPopupFooter className="mt-4">
                <Button variant="outline" size="sm">Contact Support</Button>
                <Button size="sm">Got it</Button>
              </ContextualPopupFooter>
            </EnhancedContextualPopup>
          </CardContent>
        </Card>

        {/* Edge Case Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MoreHorizontal className="h-5 w-5" />
              Edge Cases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test popups in different viewport positions.
            </p>
            <div className="space-y-2">
              <EnhancedContextualPopup
                trigger={
                  <Button variant="outline" size="sm" className="w-full">
                    Top Edge
                  </Button>
                }
                variant="default"
              >
                <div className="p-4">
                  <ContextualPopupTitle>Top Edge Test</ContextualPopupTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    This popup should appear below the button when near the top edge.
                  </p>
                </div>
              </EnhancedContextualPopup>

              <EnhancedContextualPopup
                trigger={
                  <Button variant="outline" size="sm" className="w-full">
                    Bottom Edge
                  </Button>
                }
                variant="default"
              >
                <div className="p-4">
                  <ContextualPopupTitle>Bottom Edge Test</ContextualPopupTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    This popup should appear above the button when near the bottom edge.
                  </p>
                </div>
              </EnhancedContextualPopup>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Use Contextual Popups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Basic Usage:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<EnhancedContextualPopup
  trigger={<Button>Click me</Button>}
>
  <ContextualPopupHeader>
    <ContextualPopupTitle>Title</ContextualPopupTitle>
    <ContextualPopupDescription>Description</ContextualPopupDescription>
  </ContextualPopupHeader>
  <div>Content goes here</div>
  <ContextualPopupFooter>
    <Button>Action</Button>
  </ContextualPopupFooter>
</EnhancedContextualPopup>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">Key Features:</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>Automatic Positioning:</strong> Popups appear near trigger elements and adjust based on available space</li>
                <li>• <strong>Responsive:</strong> Works on all screen sizes and orientations</li>
                <li>• <strong>Scroll Prevention:</strong> Background scrolling is prevented when popup is open</li>
                <li>• <strong>Keyboard Support:</strong> Escape key closes the popup</li>
                <li>• <strong>Click Outside:</strong> Clicking outside the popup closes it</li>
                <li>• <strong>Smooth Animations:</strong> Framer Motion animations for smooth transitions</li>
                <li>• <strong>Controlled State:</strong> Support for both controlled and uncontrolled state management</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContextualPopupDemo; 
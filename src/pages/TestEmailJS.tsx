import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sendOrderEmail, testEmailJS } from '@/utils/emailjs';
import { useToast } from '@/hooks/use-toast';

const TestEmailJS: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testEmailSending = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    addLog('🧪 Starting EmailJS test...');
    
    try {
      // Test 1: Basic EmailJS test
      addLog('📧 Testing basic EmailJS functionality...');
      const basicTest = await testEmailJS();
      addLog(basicTest ? '✅ Basic test passed' : '❌ Basic test failed');
      
      // Test 2: Detailed order email test
      addLog('📧 Testing detailed order email...');
      const orderData = {
        order_number: 'TEST-EMAILJS-001',
        total_amount: '299.00',
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '+91 9876543210',
        shipping_address: '123 Test Street, Mumbai, Maharashtra 400001',
        items: [
          { name: 'Lavender Soap', quantity: 2, price: '149.50' },
          { name: 'Rose Soap', quantity: 1, price: '199.00' }
        ]
      };
      
      const emailResult = await sendOrderEmail(orderData);
      addLog(emailResult ? '✅ Order email test passed' : '❌ Order email test failed');
      
      if (emailResult) {
        toast({
          title: '✅ Email Test Successful!',
          description: 'Check your Gmail accounts for test emails.',
        });
        addLog('🎉 All tests completed successfully!');
      } else {
        toast({
          variant: 'destructive',
          title: '❌ Email Test Failed',
          description: 'Check browser console for detailed error messages.',
        });
        addLog('❌ Email tests failed - check console for details');
      }
      
    } catch (error: any) {
      addLog(`❌ Test error: ${error.message}`);
      toast({
        variant: 'destructive',
        title: '❌ Test Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>🧪 EmailJS Test Page</CardTitle>
          <CardDescription>
            Test your EmailJS configuration and see if emails are being sent correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testEmailSending} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '🧪 Testing...' : '🧪 Test EmailJS Configuration'}
          </Button>
          
          {testResults.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📧 Expected Email Recipients:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• aksharthakkar774@gmail.com</li>
              <li>• hjdunofficial21@gmail.com</li>
              <li>• vilaura.official@gmail.com</li>
            </ul>
            <p className="text-xs text-blue-600 mt-2">
              Check these email addresses for test emails after running the test.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestEmailJS; 
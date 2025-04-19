import { useRouter } from 'next/router';
import { useState } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import Link from 'next/link';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const ReportForm = styled.form`
  background-color: ${({ theme }) => theme.colors.card};
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 1rem;
  min-height: 150px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const BackLink = styled.a`
  display: inline-block;
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.errorBg};
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success};
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.successBg};
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ReportPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    email: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a production environment, this would submit to an API endpoint
      // Mock success response for demonstration
      console.log(`Reporting thread ${id} with reason: ${formData.reason}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      
      // Clear form
      setFormData({
        reason: '',
        description: '',
        email: ''
      });
      
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Report Encrypted Content</title>
        <meta name="description" content="Report problematic encrypted content" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      <Container>
        <PageTitle>Report Content</PageTitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && (
          <SuccessMessage>
            Your report has been submitted successfully. Thank you for helping keep our platform safe.
          </SuccessMessage>
        )}
        
        {!success ? (
          <ReportForm onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="reason">Reason for report</Label>
              <Input
                type="text"
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                placeholder="E.g., Inappropriate content, spam, etc."
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Detailed description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Please provide details about the issue with this content"
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="email">Your email (optional)</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="For follow-up communication if needed"
              />
            </FormGroup>
            
            <SubmitButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </SubmitButton>
          </ReportForm>
        ) : null}
        
        <Link href={`/view/${id}`} passHref>
          <BackLink>← Back to encrypted content</BackLink>
        </Link>
      </Container>
    </>
  );
};

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps() {
  return {
    props: {}
  };
}

export default ReportPage;
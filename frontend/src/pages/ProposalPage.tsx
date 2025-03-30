// components/CreateProposalForm.tsx
import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";

// Define types for the form data
interface ProposalFormData {
  title: string;
  description: string;
  fundingGoal: string | number;
}

// Define props interface
interface CreateProposalFormProps {
  userToken: string;
}

const CreateProposalForm: React.FC<CreateProposalFormProps> = ({
  userToken,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProposalFormData>({
    title: "",
    description: "",
    fundingGoal: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "fundingGoal" ? parseFloat(value) || "" : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          ...formData,
          fundingGoal: parseFloat(formData.fundingGoal as string),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create proposal");
      }

      const data: { id: number } = await response.json();
      navigate(`/proposals/${data.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-w-3xl max-h-[500px]  p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Proposal
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Proposal Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            placeholder="Enter your proposal title"
          />
        </div>

        {/* Description Field */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            placeholder="Describe your proposal in detail"
          />
        </div>

        {/* Funding Goal Field */}
        <div>
          <label
            htmlFor="fundingGoal"
            className="block text-sm font-medium text-gray-700"
          >
            Funding Goal ($)
          </label>
          <input
            type="number"
            id="fundingGoal"
            name="fundingGoal"
            value={formData.fundingGoal}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
            placeholder="Enter funding goal amount"
          />
        </div>

        {/* Error Message */}
        {error && <div className="text-red-500 text-sm">{error}</div>}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Submitting..." : "Create Proposal"}
          </button>
        </div>
      </form>
    </div>
  );
};

// Page component for /proposals/new
const NewProposalPage: React.FC = () => {
  const userToken: string = "";

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <CreateProposalForm userToken={userToken} />
    </div>
  );
};

export default NewProposalPage;

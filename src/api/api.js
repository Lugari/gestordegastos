import axios from "axios";

const API_BASE_URL = "http://localhost:3001"; // Replace with your API URL

export const fetchUserData = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
  return response.data;
};

export const fetchTransactionSummary = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/transactions/summary?user_id=${userId}`);
  return response.data;
};

export const fetchBudgets = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/budgets?user_id=${userId}`);
  return response.data;
};

export const fetchSavings = async (userId) => {
  const response = await axios.get(`${API_BASE_URL}/savings?user_id=${userId}`);
  return response.data;
};

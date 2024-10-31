const generateVerificationCode = (length: number = 5): string => {
  // Generate a random number with specified length
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  // Generate a random number between min and max (inclusive)
  const code = Math.floor(Math.random() * (max - min + 1)) + min;

  // Convert to string and pad with zeros if necessary
  return code.toString().padStart(length, "0");
};

export { generateVerificationCode };

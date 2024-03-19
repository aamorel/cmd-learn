export const getPossibleDomains = async (): Promise<Domain[]> => {
  const response = await fetch("http://localhost:3001/domains");
  const res = await response.json();
  return res;
};

//
export const tickProblemAsAnswered = async (problem: Problem) => {
  await fetch(`http://localhost:3001/problems/${problem.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...problem, answered: 1 }),
  });
};

export const getPossibleSubcategories = async (
  domain: Domain
): Promise<string[]> => {
  const response = await fetch(
    `http://localhost:3001/subcategories?domain=${domain.domain}`
  );
  const res = await response.json();
  return res.map((element: { subcategory: string }) => element.subcategory);
};

export const getProblemsForDomain = async (
  domain: Domain
): Promise<Problem[]> => {
  const response = await fetch(
    `http://localhost:3001/problems?domain=${domain.domain}`
  );
  const res = await response.json();

  return res;
};

export const saveDomain = (domain: Domain) => {
  localStorage.setItem("domain", JSON.stringify(domain));
};

export const retrieveDomain = (): Domain | null => {
  if (localStorage.getItem("domain")) {
    return JSON.parse(localStorage.getItem("domain") as string);
  }
  return null;
};

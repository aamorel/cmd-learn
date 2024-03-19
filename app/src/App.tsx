import { useState, useEffect } from "react";
import Header from "./components/Header";
import ChooseDomain from "./components/ChooseDomain";
import LanguageQuiz from "./components/LanguageQuiz";
import { saveDomain, retrieveDomain, getPossibleDomains } from "./dbUtils";
import Button from "./components/Button";

function App() {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [possibleDomains, setPossibleDomains] = useState<Domain[]>([]);

  useEffect(() => {
    const retrieve = async () => {
      const savedDomain = retrieveDomain();
      if (savedDomain) {
        setDomain(savedDomain);
      }
    };
    retrieve();
  }, []);

  useEffect(() => {
    const getDomains = async () => {
      const domains = await getPossibleDomains();
      setPossibleDomains(domains);
    };
    getDomains();
  }, []);

  const onSelectedDomain = async (domain: Domain) => {
    setDomain(domain);
    saveDomain(domain);
  };
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 font-main text-white p-8">
      <div className="w-full">
        <Header title="cmd learn" />
      </div>
      {!domain ? (
        <ChooseDomain
          onSelectedDomain={onSelectedDomain}
          possibleDomains={possibleDomains}
        />
      ) : (
        <div>
          <div className="absolute top-12">
            <p>
              {domain.domain} - {domain.category}
            </p>
            <Button
              onClick={() => setDomain(null)}
              text="change domain"
              secondary
            />
          </div>

          {domain.category === "language" && <LanguageQuiz domain={domain} />}
        </div>
      )}
    </main>
  );
}

export default App;

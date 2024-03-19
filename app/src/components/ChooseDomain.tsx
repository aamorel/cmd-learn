import Button from "./Button";

interface ChooseDomainProps {
  onSelectedDomain: (domain: Domain) => void;
  possibleDomains: Domain[];
}

export default function ChooseDomain({
  onSelectedDomain,
  possibleDomains,
}: ChooseDomainProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-xl font-bold mb-4">Choose a domain</h1>
      <div className="mb-4 flex flex-col space-y-4">
        {possibleDomains.map((domain: Domain, index: number) => (
          <Button
            key={index}
            text={`${domain.domain} - ${domain.category}`}
            onClick={() => onSelectedDomain(domain)}
          />
        ))}
      </div>
    </div>
  );
}

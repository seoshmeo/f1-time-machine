interface CountryFlagProps {
  country: string;
}

const CountryFlag = ({ country }: CountryFlagProps) => {
  return (
    <span style={{
      color: '#B0B0B0',
      fontSize: '13px',
    }}>
      {country}
    </span>
  );
};

export default CountryFlag;

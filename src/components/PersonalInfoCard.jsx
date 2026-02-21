const PersonalInfoCard = ({ person, creditsCount }) => {
  return (
    <div className="glass glass-hover p-4 space-y-3 shadow-lg">
      <h3 className="font-bold text-lg mb-4">Personal Info</h3>
      
      {creditsCount > 0 && (
        <div>
          <p className="text-sm text-gray-400">Known Credits</p>
          <p className="font-semibold">{creditsCount}</p>
        </div>
      )}
      
      {person.birthday && (
        <div>
          <p className="text-sm text-gray-400">Birthday</p>
          <p className="font-semibold">{person.birthday}</p>
        </div>
      )}
      
      {person.place_of_birth && (
        <div>
          <p className="text-sm text-gray-400">Place of Birth</p>
          <p className="font-semibold">{person.place_of_birth}</p>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoCard;



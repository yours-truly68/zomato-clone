import { BiUpload } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

interface AddRiderProps {
  adharNumber: string;
  drivingLicenseNumber: string;
  phoneNumber: string;
  image: File | null;

  setAdharNumber: (value: string) => void;
  setDrivingLicenseNumber: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  setImage: (file: File | null) => void;

  handleSubmit: () => void;
  submitting: boolean;
}

const AddRider = ({
  adharNumber,
  drivingLicenseNumber,
  phoneNumber,
  image,
  setAdharNumber,
  setDrivingLicenseNumber,
  setPhoneNumber,
  setImage,
  handleSubmit,
  submitting,
}: AddRiderProps) => {
  const navigate = useNavigate();
  navigate("/rider/dashboard");
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
        <h1 className="text-xl font-semibold text-center">Add your Profile</h1>

        <input
          type="number"
          placeholder="Aadhar Number..."
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
          value={adharNumber}
          onChange={(e) => setAdharNumber(e.target.value)}
        />

        <input
          type="text"
          placeholder="Driving License Number..."
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
          value={drivingLicenseNumber}
          onChange={(e) => setDrivingLicenseNumber(e.target.value)}
        />

        <input
          type="tel"
          placeholder="Contact Number..."
          className="w-full rounded-lg border px-4 py-3 text-sm outline-none border-gray-200"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        <label className="cursor-pointer flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-500 hover:bg-gray-100">
          <BiUpload className="h-5 w-5 text-red-500" />
          {image ? image.name : "Upload Rider Image"}
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImage(e.target.files ? e.target.files[0] : null)
            }
            hidden
          />
        </label>

        <button
          className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e23744] disabled:opacity-50"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Adding..." : "Add Rider"}
        </button>
      </div>
    </div>
  );
};

export default AddRider;

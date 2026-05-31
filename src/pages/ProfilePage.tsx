import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { optimizeImageFile } from "../utils/imageUpload";
import "../styles/shared/LoadingState.css";

const restrictLettersOnly = (value: string) => value.replace(/[^A-Za-z\s.'-]/g, "");
const restrictDigitsOnly = (value: string, maxLength = 10) =>
  value.replace(/\D/g, "").slice(0, maxLength);

const ProfilePage: React.FC = () => {
  const { completeProfile, user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || "");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setUploadingImage(true);
    try {
      setProfileImageUrl(await optimizeImageFile(file));
    } catch {
      toast.error("Unable to process selected profile photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim()) {
      toast.error("Full name and mobile number are required.");
      return;
    }

    setSaving(true);
    const result = await completeProfile({
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim() || undefined,
      profileImageUrl: profileImageUrl.trim() || undefined,
    });
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Profile updated.");
  };

  return (
    <section className="shell section page-section">
      <div className="page-header">
        <span className="eyebrow">Profile</span>
        <h1>Edit profile</h1>
      </div>

      <div className="checkout-layout">
        <form className="store-card form-card" onSubmit={handleSubmit}>
          <h2>Profile details</h2>
          <div className="form-grid">
            <label>
              Full name
              <input
                value={fullName}
                onChange={(event) => setFullName(restrictLettersOnly(event.target.value))}
                onPaste={(event) => {
                  event.preventDefault();
                  setFullName(restrictLettersOnly(event.clipboardData.getData("text")));
                }}
                inputMode="text"
                pattern="[A-Za-z\s.'-]+"
                required
              />
            </label>
            <label>
              Mobile number
              <input
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(restrictDigitsOnly(event.target.value))}
                onPaste={(event) => {
                  event.preventDefault();
                  setPhoneNumber(restrictDigitsOnly(event.clipboardData.getData("text")));
                }}
                inputMode="numeric"
                pattern="\d{10}"
                maxLength={10}
                required
              />
            </label>
            <label>
              Email optional
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Profile photo
              <input type="file" accept="image/*" onChange={handleProfileImageChange} disabled={saving || uploadingImage} />
            </label>
            {profileImageUrl ? (
              <div className="profile-photo-preview form-grid__wide">
                <img src={profileImageUrl} alt="Selected profile" />
                <button type="button" className="link-button" onClick={() => setProfileImageUrl("")}>
                  Remove photo
                </button>
              </div>
            ) : null}
          </div>
          <button className="button" type="submit" disabled={saving || uploadingImage}>
            {saving || uploadingImage ? (
              <span className="button-loading">
                <span className="button-loading__spinner" aria-hidden="true" />
                {uploadingImage ? "Preparing photo..." : "Saving..."}
              </span>
            ) : (
              "Save profile"
            )}
          </button>
        </form>

        <aside className="store-card summary-card">
          <h2>Preview</h2>
          {profileImageUrl ? (
            <img className="profile-menu__avatar profile-menu__avatar--large" src={profileImageUrl} alt={fullName} />
          ) : null}
          <div>
            <span>Name</span>
            <strong>{fullName || "Not set"}</strong>
          </div>
          <div>
            <span>Mobile</span>
            <strong>{phoneNumber || "Not set"}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{email || "Optional"}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default ProfilePage;

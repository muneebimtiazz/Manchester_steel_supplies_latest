import { useState } from "react";
import bg_img from "../assets/Gemini_Generated_Image_6f6sj86f6sj86f6s.png";
import logo from "../assets/Group_20.png";
import { NavLink, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useSnackbar } from "notistack";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // const handleSubmit = async (e:any) => {
  //   e.preventDefault();
  //   if (loading) return;

  //   try {
  //     setLoading(true);
  //     await register({ fname, lname, email, password });
  //     navigate("/");
  //   } catch (err) {
  //     console.log(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      await register({ fname, lname, email, password });

      enqueueSnackbar("Registration successful", {
        variant: "success",
      });

      navigate("/");
    } catch (err: any) {
      enqueueSnackbar(
        err?.response?.data?.message || "Registration failed",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen sm:h-screen sm:overflow-hidden bg-white sm:flex justify-center p-2">
      <div className="hidden sm:flex sm:w-[60%] bg-[#F3EC19] rounded-md h-full items-end justify-center">
        <img src={bg_img} className="w-full" alt="background" />
      </div>

      <div className="w-full sm:w-[40%] flex flex-col justify-between py-8 sm:py-10 px-6 sm:px-24">
        <div><img src={logo} className="max-w-full h-auto" alt="logo" /></div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div>
            <h1 className="hidden sm:block text-4xl mb-3 font-normal">Create your account</h1>
            <p className="hidden sm:block text-md">Let's get you started.</p>

            <div className="my-3 sm:my-10 flex flex-col space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col w-full">
                  <label className="mb-1 text-sm text-gray-700">First Name</label>
                  <input value={fname} onChange={(e) => setFname(e.target.value)} type="text" placeholder="First Name" className="w-full h-11 px-4 border border-[#1E1E1E] rounded-md text-sm outline-none focus:border-black focus:ring-1" />
                </div>

                <div className="flex flex-col w-full">
                  <label className="mb-1 text-sm text-gray-700">Last Name</label>
                  <input value={lname} onChange={(e) => setLname(e.target.value)} type="text" placeholder="Last Name" className="w-full h-11 px-4 border border-[#1E1E1E] rounded-md text-sm outline-none focus:border-black focus:ring-1" />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm text-gray-700">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full h-11 px-4 border border-[#1E1E1E] rounded-md text-sm outline-none focus:border-black focus:ring-1" />
              </div>

              <div className="flex flex-col">
                <label className="mb-1 text-sm text-gray-700">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full h-11 px-4 border border-[#1E1E1E] rounded-md text-sm outline-none focus:border-black focus:ring-1" />
              </div>

              <div className="text-xs flex items-center gap-1">
                <span>Already have an account?</span>
                <NavLink to="/login" className="text-xs text-blue-600 hover:underline">Log in</NavLink>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-[#1E1E1E] text-white rounded-md mt-6 disabled:opacity-50">{loading ? "Registering..." : "Register"}</button>
          </div>
        </form>

        <p className="text-xs text-[#9E9E9E] text-center">© 2026 Manchester Steel Supplies. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Register;
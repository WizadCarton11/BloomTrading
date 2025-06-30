import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TrendingUp, Mail, Lock, User, ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthService } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useAxiosWrapper } from "@/context/AxiosWrapper";
import { set } from "date-fns";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleLogin = async () => {
    try {
      
      const response = await AuthService.post('api/auth/login', {
        email: loginData.email,
        password: loginData.password,
      },
      {},
      'loginKey'
    );

      const successToast=toast({
        variant: "default",
        title: "Login Successful",
        description: "Redirecting to dashboard...",
      });

      // Save token to localStorage/cookie if needed here

      setTimeout(() => {
        navigate("/home"); 
        successToast.dismiss();
      }, 1000);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: err.message || "Invalid email or password",
      });
    }
  };
  const tokenValidation = async () => {
    try {
      const response = await AuthService.get('api/auth/me', {}, 'getUserKey');
      console.log("Token validation response:", response.status);
      navigate("/home");
    } catch (err) {
      // setLoading(false);
      // Handle error, possibly redirect to login
      console.error("Token validation failed:", err);
      navigate("/login?tab=signin");
    }
  };
  
  useEffect(() => {
      // Check if user is already authenticated
      tokenValidation();
    }, []);
  useEffect(() => {
    // Check URL parameters for tab selection
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    if (tab === "signup") {
      setActiveTab("signup");
    }
  }, [location]);
  if (AuthService.isLoading('getUserKey')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader">
          <div className="spinner"></div>
          <p className="text-muted-foreground">Checking your last session...</p>

        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Moving Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background/90 z-10" >
        
        {/* Moving gradient circles */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-electric-500/20 blur-[100px]"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/20 blur-[100px]"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div 
          className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-neon-500/20 blur-[100px]"
          animate={{
            x: [0, -70, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        </div>
      </div>
      
      {/* Back to home link */}
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors z-20">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      
      {/* Logo */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-20">
        <div className="w-8 h-8 bg-gradient-to-br from-electric-500 to-purple-600 rounded-lg flex items-center justify-center">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">DarkBloom</span>
      </div>
      
      {/* Login/Signup Form */}
      <motion.div 
        className="w-full max-w-md z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="trading-card border-white/10 backdrop-blur-sm bg-background/70">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {activeTab === "signin" ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === "signin" 
                ? "Enter your credentials to access your account" 
                : "Enter your information to create your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      placeholder="name@example.com" 
                      type="email" 
                      className="pl-10"
                      value={loginData.email}
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-electric-400 hover:text-electric-300">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-10"
                      value={loginData.password}
                      onChange={handleLoginChange}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full bg-electric-600 hover:bg-electric-700 glow-effect"
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
              </TabsContent>

              
              <TabsContent value="signup" className="space-y-4">
                <SignUpForm setActiveTab={setActiveTab} />
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              By continuing, you agree to DarkBloom's{" "}
              <Link to="/terms" className="text-electric-400 hover:text-electric-300">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-electric-400 hover:text-electric-300">
                Privacy Policy
              </Link>
              .
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const SignUpForm = ({setActiveTab}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const authUrl = import.meta.env.VITE_API_AUTH_BACKEND_URL
  const { loading, error, post} = useAxiosWrapper(authUrl)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(authUrl)
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }
    try {
      const response = await post('api/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      
        toast({
          variant: "default",
          title: "Success",
          description: "Account created successfully. Please log in.",
        })
        setTimeout(() => {
          setActiveTab("signin");
        }, 1000);
        
      
    } catch (err: any) {
      console.log(err)
      if (err.message) {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message || "An error occurred. Please try again.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="firstName" placeholder="John" className="pl-10" onChange={handleChange} required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="lastName" placeholder="Doe" className="pl-10" onChange={handleChange} required />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="email" placeholder="name@example.com" type="email" className="pl-10" onChange={handleChange} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="password" type="password" className="pl-10" onChange={handleChange} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input id="confirmPassword" type="password" className="pl-10" onChange={handleChange} required />
        </div>
      </div>
      <Button type="submit" className="w-full bg-electric-600 hover:bg-electric-700 glow-effect" >
      Sign Up
      </Button>
    </form>
  );
};

export default LoginPage;

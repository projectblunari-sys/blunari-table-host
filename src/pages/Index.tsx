import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, TableProperties, Users } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="px-4 py-6 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://raw.githubusercontent.com/3sc0rp/Blunari/refs/heads/main/logo-bg.png" 
              alt="Blunari Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-foreground">Blunari</span>
          </div>
          <Button asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="px-4 py-16 md:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Restaurant Management Made Simple
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mt-6">
              Complete booking system, table management, and customer insights for restaurants.
            </p>
            <Button size="lg" className="text-lg px-8 mt-8" asChild>
              <Link to="/auth">Start Free Trial</Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Index;

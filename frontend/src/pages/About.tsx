import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Cog, Lightbulb, Users, Code, Database, Brain, Smartphone } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const About = () => {
  const technologies = [
    { name: 'React', category: 'Frontend' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'Leaflet', category: 'Mapping' },
    { name: 'Recharts', category: 'Analytics' },
    { name: 'Vite', category: 'Build Tool' },
  ];

  const futureScope = [
    {
      icon: Database,
      title: 'Real IoT Sensor Integration',
      description: 'Connect with physical traffic sensors and cameras for real-time data collection'
    },
    {
      icon: Brain,
      title: 'AI-based Traffic Prediction',
      description: 'Machine learning algorithms to predict traffic patterns and optimize signal timing'
    },
    {
      icon: Smartphone,
      title: 'Mobile App Integration',
      description: 'Mobile applications for emergency services and traffic management personnel'
    },
    {
      icon: Cog,
      title: 'City-wide Network',
      description: 'Interconnected traffic management across multiple intersections and zones'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            About Our Smart Traffic Management System
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            An innovative IoT-based solution for optimizing urban traffic flow and emergency response
          </p>
        </div>

        {/* Project Objective */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Project Objective
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              The Smart Traffic Management System addresses the critical need for efficient urban traffic control in modern cities. 
              By leveraging IoT sensors, real-time data processing, and intelligent algorithms, our system dynamically optimizes 
              traffic signal timing to reduce congestion, minimize wait times, and prioritize emergency vehicles. This innovative 
              approach aims to improve overall traffic flow, reduce fuel consumption, and enhance the quality of urban life.
            </p>
          </CardContent>
        </Card>

        {/* How it Works */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cog className="w-5 h-5" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Data Collection</h3>
                <p className="text-sm text-muted-foreground">
                  IoT sensors monitor vehicle density, speed, and traffic patterns at each intersection
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Smart Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced algorithms analyze traffic data and calculate optimal signal timing
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cog className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Dynamic Control</h3>
                <p className="text-sm text-muted-foreground">
                  Traffic signals adapt in real-time based on current conditions and emergency priorities
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
              <h4 className="font-semibold mb-3">System Architecture:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• <strong>Sensor Layer:</strong> Vehicle detection sensors, cameras, and environmental monitors</p>
                <p>• <strong>Communication Layer:</strong> Wireless data transmission and edge computing</p>
                <p>• <strong>Processing Layer:</strong> Real-time analytics and decision-making algorithms</p>
                <p>• <strong>Control Layer:</strong> Traffic signal management and emergency response systems</p>
                <p>• <strong>Interface Layer:</strong> Web dashboard and mobile applications for monitoring</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Scope */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Future Scope & Enhancements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {futureScope.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gradient-to-r from-muted/20 to-accent/5 rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Technologies Used */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Technologies Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {technologies.map((tech, index) => (
                  <div key={index} className="flex flex-col">
                    <Badge variant="outline" className="mb-1">
                      {tech.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{tech.category}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-muted/20 to-accent/5 rounded-lg">
                <h4 className="font-semibold mb-2">Architecture:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Frontend: Modern React with TypeScript for type safety</li>
                  <li>• Styling: Tailwind CSS for responsive design</li>
                  <li>• Maps: Leaflet for interactive traffic visualization</li>
                  <li>• Charts: Recharts for comprehensive analytics</li>
                  <li>• Build: Vite for fast development and optimized builds</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Team Information */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Project Features:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Real-time traffic monitoring and control</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Emergency vehicle priority system</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Interactive traffic simulation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Comprehensive analytics dashboard</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm">Responsive web interface</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Development Info:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Framework:</strong> React 18 with TypeScript</p>
                    <p><strong>Deployment:</strong> Vite for optimal performance</p>
                    <p><strong>Design System:</strong> Custom Tailwind configuration</p>
                    <p><strong>Version:</strong> 1.0.0 (Demo)</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                  <h4 className="font-semibold mb-2">Note:</h4>
                  <p className="text-sm text-muted-foreground">
                    This is a demonstration version of the Smart Traffic Management System. 
                    In a production environment, it would integrate with real IoT sensors and 
                    traffic control hardware.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
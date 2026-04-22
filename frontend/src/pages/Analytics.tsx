import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Clock, Car, Activity } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const Analytics = () => {
  // Sample data for charts
  const vehicleDensityData = [
    { lane: 'Lane 1', vehicles: 15, avgWaitTime: 45 },
    { lane: 'Lane 2', vehicles: 5, avgWaitTime: 20 },
    { lane: 'Lane 3', vehicles: 12, avgWaitTime: 35 },
    { lane: 'Lane 4', vehicles: 8, avgWaitTime: 25 },
  ];

  const signalTimingData = [
    { time: '08:00', lane1: 30, lane2: 15, lane3: 25, lane4: 20 },
    { time: '09:00', lane1: 35, lane2: 10, lane3: 20, lane4: 25 },
    { time: '10:00', lane1: 25, lane2: 20, lane3: 30, lane4: 15 },
    { time: '11:00', lane1: 30, lane2: 15, lane3: 25, lane4: 20 },
    { time: '12:00', lane1: 40, lane2: 12, lane3: 28, lane4: 18 },
    { time: '13:00', lane1: 32, lane2: 18, lane3: 22, lane4: 22 },
  ];

  const trafficFlowData = [
    { name: 'Smooth Flow', value: 65, color: '#22c55e' },
    { name: 'Moderate Congestion', value: 25, color: '#f59e0b' },
    { name: 'Heavy Traffic', value: 10, color: '#ef4444' },
  ];

  // Predictive AI Forecast Data
  const predictionData = [
    { time: 'Now', actual: 45, predicted: 45 },
    { time: '+10m', predicted: 52 },
    { time: '+20m', predicted: 68 },
    { time: '+30m', predicted: 85 }, // Rush hour peak
    { time: '+40m', predicted: 75 },
    { time: '+50m', predicted: 60 },
    { time: '+60m', predicted: 42 },
  ];

  const summaryStats = [
    {
      title: 'Average Wait Time',
      value: '31.25 sec',
      icon: Clock,
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Total Vehicles Today',
      value: '2,847',
      icon: Car,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Emergency Responses',
      value: '7',
      icon: Activity,
      change: '-2%',
      trend: 'down'
    },
    {
      title: 'System Efficiency',
      value: '94.5%',
      icon: TrendingUp,
      change: '+3%',
      trend: 'up'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Traffic Analytics & Reports
          </h1>
          <p className="text-muted-foreground text-lg">
            Comprehensive analysis of traffic patterns and system performance
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryStats.map((stat, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last week
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Predictive AI Forecasting */}
        <Card className="bg-card/50 backdrop-blur-sm border-traffic-amber/40 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 bg-traffic-amber/20 text-traffic-amber text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Activity className="w-3 h-3" /> AI PREDICTION ACTIVE
          </div>
          <CardHeader>
            <CardTitle>🔮 60-Minute Congestion Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Predictive model analyzing current YOLO detection rates and historical data to forecast upcoming traffic volume. 
              System will preemptively adjust signal timings at <strong className="text-traffic-amber">+20m</strong> to mitigate the predicted spike.
            </p>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" name="Actual Volume" />
                <Area type="monotone" dataKey="predicted" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPredicted)" strokeDasharray="5 5" name="Predicted Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Vehicle Density Chart */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Vehicle Density per Lane</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vehicleDensityData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="lane" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="vehicles" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Traffic Flow Distribution */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Traffic Flow Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficFlowData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {trafficFlowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Signal Duration Analysis */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mb-8">
          <CardHeader>
            <CardTitle>Green Signal Duration Analysis (Last 6 Hours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={signalTimingData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="lane1" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Lane 1"
                />
                <Line 
                  type="monotone" 
                  dataKey="lane2" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Lane 2"
                />
                <Line 
                  type="monotone" 
                  dataKey="lane3" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Lane 3"
                />
                <Line 
                  type="monotone" 
                  dataKey="lane4" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Lane 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Wait Time Table */}
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle>Performance Metrics by Lane</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Lane</th>
                    <th className="text-left py-3 px-4 font-semibold">Current Vehicles</th>
                    <th className="text-left py-3 px-4 font-semibold">Avg Wait Time</th>
                    <th className="text-left py-3 px-4 font-semibold">Vehicles Passed Today</th>
                    <th className="text-left py-3 px-4 font-semibold">Efficiency Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleDensityData.map((lane, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 px-4 font-medium">{lane.lane}</td>
                      <td className="py-3 px-4">{lane.vehicles}</td>
                      <td className="py-3 px-4">{lane.avgWaitTime}s</td>
                      <td className="py-3 px-4">{712 - index * 50}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          index === 1 ? 'bg-green-100 text-green-800' :
                          index === 0 ? 'bg-blue-100 text-blue-800' :
                          index === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {index === 1 ? 'Excellent' :
                           index === 0 ? 'Good' :
                           index === 2 ? 'Average' :
                           'Fair'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Analytics;
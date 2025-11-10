import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Mang Nurdin Sutrisno',
      position: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
      description: 'Passionate about bringing the best cinema experience to our community'
    },
    {
      name: 'Mang Asep Supriatna',
      position: 'Operations Manager',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjlegydxz-RwAxSOZ0BiDxjlXgCvgCcPmaZA&s',
      description: 'Ensuring smooth operations and customer satisfaction'
    },
    {
      name: 'Mang Bambang Hariyanto',
      position: 'Technical Director',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      description: 'Managing our state-of-the-art cinema technology'
    }
  ];

  const milestones = [
    { year: '2020', event: 'GGCinema Founded' },
    { year: '2021', event: 'First Theater Opened' },
    { year: '2022', event: 'Digital Platform Launch' },
    { year: '2023', event: 'Premium IMAX Theater Added' },
    { year: '2024', event: 'Expansion to 5 Theaters' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 py-20 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About GGCinema</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            We are dedicated to providing the ultimate movie experience with cutting-edge technology, 
            comfortable seating, and exceptional customer service in the heart of The city.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              🎯
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To create unforgettable movie experiences by combining the latest cinema technology 
              with exceptional hospitality, making every visit to GGCinema a memorable journey 
              into the world of entertainment.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              👁️
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become the leading cinema destination in East Java, known for innovation, 
              quality, and community engagement, while continuously evolving to meet the 
              changing needs of movie enthusiasts.
            </p>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-600 leading-relaxed mb-6">
              GGCinema was born from a simple dream: to bring world-class cinema entertainment 
              to the beautiful city. Founded in 2020 by a group of movie enthusiasts and 
              local entrepreneurs, we recognized the need for a premium movie-watching experience 
              in our community.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Starting with a single theater, we've grown to become The city premier cinema destination, 
              featuring multiple screens, including our flagship IMAX theater. Our commitment to 
              excellence extends beyond just showing movies – we create experiences that bring 
              families and friends together.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Today, GGCinema stands as a testament to what's possible when passion meets 
              innovation. We continue to invest in the latest technology, from 4K projection 
              systems to immersive sound experiences, ensuring that every movie feels like 
              a grand adventure.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Journey</h2>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {milestone.year}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{milestone.event}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                ❤️
              </div>
              <h3 className="font-bold mb-2">Passion</h3>
              <p className="text-gray-600 text-sm">We love what we do and it shows in every detail</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                ⭐
              </div>
              <h3 className="font-bold mb-2">Excellence</h3>
              <p className="text-gray-600 text-sm">We strive for perfection in every experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                🤝
              </div>
              <h3 className="font-bold mb-2">Community</h3>
              <p className="text-gray-600 text-sm">We're proud to be part of the GG community</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                🚀
              </div>
              <h3 className="font-bold mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">We embrace new technology and ideas</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
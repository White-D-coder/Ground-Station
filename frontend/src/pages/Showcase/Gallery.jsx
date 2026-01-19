import React from 'react';

const Gallery = () => {
    // Simulating multiple images since we only have one asset currently.
    // In a real scenario, these would be different image paths.
    const galleryItems = [
        { id: 1, src: "/_ (27).jpeg", title: "Mission Dashboard", desc: "Real-time overview of all subsystems." },
        { id: 2, src: "/_ (27).jpeg", title: "Telemetry Analysis", desc: "Deep dive into signal strength and packet loss." },
        { id: 3, src: "/_ (27).jpeg", title: "3D Visualizer", desc: "Live tracking of the vehicle in 3D space." },
        { id: 4, src: "/_ (27).jpeg", title: "Control Panel", desc: "Direct command interface for vehicle systems." },
    ];

    return (
        <section className="gallery-section" style={{ minHeight: '100vh', padding: '120px 2rem 5rem' }}>
            <h2 className="section-title">Mission Gallery</h2>
            <div className="gallery-grid">
                {galleryItems.map((item) => (
                    <div key={item.id} className="gallery-item">
                        <div className="image-wrapper">
                            <img src={item.src} alt={item.title} />
                            <div className="overlay">
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Gallery;

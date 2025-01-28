import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Warp = () => {
    const mountRef = useRef(null);
    const starMaterialRef = useRef(null);

    let mouseX = 0, mouseY = 0;

    const onPointerMove = (event) => {
        if (event.isPrimary === false) return;
        const limitX = 10; // Максимальное значение по оси X
        const limitY = 10; // Максимальное значение по оси Y
        mouseX = Math.max(-limitX, Math.min(event.clientX - (window.innerWidth / 2), limitX));
        mouseY = Math.max(-limitY, Math.min(event.clientY - (window.innerHeight / 2), limitY));
    };

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        document.body.style.touchAction = 'none';
        document.body.addEventListener('pointermove', onPointerMove);
        const renderer = new THREE.WebGLRenderer({ alpha: true });

        if (mountRef.current) {
            renderer.setSize(window.innerWidth, window.innerHeight);
            mountRef.current.appendChild(renderer.domElement);
        }

        const starGeo = new THREE.BufferGeometry();
        const sprite = new THREE.TextureLoader().load('textures/sprites/star.png');
        const starMaterial = new THREE.PointsMaterial({
            size: 2,
            map: sprite,
            transparent: true,
            opacity: 1,
            vertexColors: true,
        });

        starMaterialRef.current = starMaterial; 

        const vertices = [];
        const colors = [];
        for (let i = 0; i < 3000; i++) {
            const x = Math.random() * 600 - 300;
            const y = Math.random() * 600 - 300;
            const z = Math.random() * 600 - 200;
            vertices.push(x, y, z);
            const color = Math.random();
            colors.push(0.5, 0.5, color);
        }
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        starGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const stars = new THREE.Points(starGeo, starMaterial);
        scene.add(stars);

        camera.rotation.y = Math.PI;

        const animate = () => {
            requestAnimationFrame(animate);

            camera.position.x += ( mouseX - camera.position.x ) * 0.05;
            camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
            
            // Warp effect
            const positions = stars.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 2] -= 0.02; // Move stars towards the camera
                if (positions[i + 2] < -100) {
                    positions[i + 2] = 400;
                }
            }
            stars.geometry.attributes.position.needsUpdate = true; // Update the position attribute

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={mountRef} />;
};

export default Warp;
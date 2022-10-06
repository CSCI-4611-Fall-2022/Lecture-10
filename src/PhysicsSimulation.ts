/* Lecture 10
 * CSCI 4611, Fall 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'
import { Room } from './Room';

export class PhysicsSimulation extends gfx.GfxApp
{
    private cameraControls: gfx.FirstPersonControls;

    private room: Room;
    private target: gfx.Transform3;

    private points: number;
    private pointsBox: gfx.BoxMesh;
    private pointsTexture: gfx.Text;

    private projectile: gfx.SphereMesh;
    private projectileVelocity: gfx.Vector3;

    private hitSound: HTMLAudioElement;

    constructor()
    {
        // The first line of any child class constructor must call
        // the base class's constructor using the super() method. 
        super();

        this.cameraControls = new gfx.FirstPersonControls(this.camera);

        this.points = 0;
        this.pointsBox = new gfx.BoxMesh(4.9, 4.9, 0.1);
        this.pointsTexture = new gfx.Text('0', 256, 256, '100px Helvetica', 'yellow', 'black');
        
        this.room = new Room(40, 15, 40);
        this.projectile = new gfx.SphereMesh(0.2, 2)
        this.target = new gfx.Transform3();

        this.projectileVelocity = new gfx.Vector3();

        this.hitSound = new Audio('./assets/beep.mp3');
    }

    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 1920/1080, 0.01, 50);
        this.camera.position.set(0, 0, 15);
        this.camera.lookAt(gfx.Vector3.ZERO);

        // Create an ambient light
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.3, 0.3, 0.3));
        this.scene.add(ambientLight);

        // Create a directional light
        const directionalLight = new gfx.DirectionalLight(new gfx.Color(0.6, 0.6, 0.6));
        directionalLight.position.set(0, 2, 1);
        this.scene.add(directionalLight);

        this.cameraControls.translationSpeed = 10;

        // Add objects to the scene
        this.scene.add(this.room);

        for(let i=5; i > 0; i--)
        {
            const disc = new gfx.SphereMesh(i, 2);
            disc.position.z = i * -0.1;
            disc.scale.z = 0.01;
            this.target.add(disc);
        }
        this.target.position.z = -19.5;
        this.target.boundingSphere.radius = 5;
        this.scene.add(this.target);

        const whiteMaterial = new gfx.UnlitMaterial();
        whiteMaterial.color.set(0.95, 0.95, 0.95);
        (this.target.children[0] as gfx.SphereMesh).material = whiteMaterial;

        const blackMaterial = new gfx.UnlitMaterial();
        blackMaterial.color.set(0.1, 0.1, 0.1);
        (this.target.children[1] as gfx.SphereMesh).material = blackMaterial;

        const blueMaterial = new gfx.UnlitMaterial();
        blueMaterial.color.set(.149, .576, .976);
        (this.target.children[2] as gfx.SphereMesh).material = blueMaterial;

        const redMaterial = new gfx.UnlitMaterial();
        redMaterial.color.set(1, 0, 0);
        (this.target.children[3] as gfx.SphereMesh).material = redMaterial;

        const yellowMaterial = new gfx.UnlitMaterial();
        yellowMaterial.color.set(1, 1, 0.15);
        (this.target.children[4] as gfx.SphereMesh).material = yellowMaterial;
    
        const projectileMaterial = new gfx.GouraudMaterial();
        projectileMaterial.ambientColor.set(1, 0, 0);
        projectileMaterial.diffuseColor.set(1, 0, 0);
        this.projectile.material = projectileMaterial;

        this.projectile.position.z = this.room.boundingBox.max.z + 1;
        this.scene.add(this.projectile);

        const pointsBoxMaterial = new gfx.UnlitMaterial();
        pointsBoxMaterial.texture = this.pointsTexture;

        this.pointsBox.position.set(-12.5, 0, -20);
        this.pointsBox.material = pointsBoxMaterial;
        this.scene.add(this.pointsBox);
    }

    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);

        if(this.projectileVelocity.length() == 0)
            return;

        // Define forces
        const gravity = -5;

        this.projectileVelocity.y += gravity * deltaTime;

        this.projectile.position.x += this.projectileVelocity.x * deltaTime;
        this.projectile.position.y += this.projectileVelocity.y * deltaTime;
        this.projectile.position.z += this.projectileVelocity.z * deltaTime;
    
        // Handle collision
        if(this.projectile.position.z - this.projectile.radius < this.room.boundingBox.min.z)
        {
            this.projectile.position.z = this.target.position.z;

            const actualDistance = this.projectile.position.distanceTo(this.target.position);
            const maxDistance = this.projectile.boundingSphere.radius + this.target.boundingSphere.radius;

            if(actualDistance < maxDistance)
            {
                if(actualDistance < 1)
                    this.points += 5;
                else if(actualDistance < 2)
                    this.points += 4;
                else if(actualDistance < 3)
                    this.points += 3;
                else if(actualDistance < 4)
                    this.points += 2;
                else
                    this.points++;

                this.pointsTexture.text = this.points.toString();
                this.pointsTexture.updateTextureImage();
                this.hitSound.play();
            }

            this.projectileVelocity.set(0, 0, 0);
            this.projectile.position.z = this.room.boundingBox.max.z + 1;
        }
        else if(!this.projectile.intersects(this.room, gfx.IntersectionMode3.AXIS_ALIGNED_BOUNDING_BOX))
        {
            this.projectileVelocity.set(0, 0, 0);
            this.projectile.position.z = this.room.boundingBox.max.z + 1;
        }
    }

    onMouseUp(event: MouseEvent): void 
    {
        if(this.projectileVelocity.length() == 0)
        {
            this.projectile.position.x = this.camera.position.x;
            this.projectile.position.y = this.camera.position.y - 1;
            this.projectile.position.z = this.camera.position.z;

            this.projectileVelocity.set(0, 5, -20);
            this.projectileVelocity.rotate(this.camera.rotation);
        }
    }
}
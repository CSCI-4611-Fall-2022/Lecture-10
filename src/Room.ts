/* Lecture 10
 * CSCI 4611, Fall 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'

export class Room extends gfx.BoxMesh
{
    constructor(width: number, height: number, depth: number)
    {
        super(width, height, depth);

        // Create the room material
        const roomMaterial = new gfx.UnlitMaterial();
        roomMaterial.color.set(0.95, 0.95, 0.95);
        roomMaterial.texture = new gfx.Texture('./assets/holodeck.png');
        roomMaterial.side = gfx.Side.DOUBLE;
        this.material = roomMaterial;
        this.tileTexture(2.5);
    }

    public tileTexture(size: number)
    {
        // We will learn about how texture coordinates work later in the course
        // For now, don't worry about this
        const uvs: number[] = [];

        // Front face
        uvs.push(0, this.height/size);
        uvs.push(this.width/size, this.height/size);
        uvs.push(this.width/size, 0);
        uvs.push(0, 0);

        // Back face
        uvs.push(this.width/size, this.height/size);
        uvs.push(0, this.height/size);
        uvs.push(0, 0);
        uvs.push(this.width/size, 0);

        // Left face
        uvs.push(0, this.height/size);
        uvs.push(this.depth/size, this.height/size);
        uvs.push(this.depth/size, 0);
        uvs.push(0, 0);

        // Right face
        uvs.push(this.depth/size, this.height/size);
        uvs.push(0, this.height/size);
        uvs.push(0, 0);
        uvs.push(this.depth/size, 0);

        // Top face
        uvs.push(0, this.depth/size);
        uvs.push(this.width/size, this.depth/size);
        uvs.push(this.width/size, 0);
        uvs.push(0, 0);

        // Bottom face
        uvs.push(this.width/size, this.depth/size);
        uvs.push(0, this.depth/size);
        uvs.push(0, 0);
        uvs.push(this.width/size, 0);

        // Assign the new texture coordinates
        this.setTextureCoordinates(uvs);
    }
}
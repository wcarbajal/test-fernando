import { Pokemon } from './pokemon.entity';

describe( 'Pokemon entity', () => {

  it( 'should assign pokemon properties', () => {

    const pokemon = new Pokemon();

    pokemon.id = 25;
    pokemon.name = 'Pikachu';
    pokemon.type = 'Electric';
    pokemon.hp = 100;
    pokemon.sprites = [ 'sprite1.png' ];

    expect( pokemon ).toEqual( {
      id: 25,
      name: 'Pikachu',
      type: 'Electric',
      hp: 100,
      sprites: [ 'sprite1.png' ],
    } );

  } );
} );
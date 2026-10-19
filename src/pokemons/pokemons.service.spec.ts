import { Test, TestingModule } from '@nestjs/testing';
import { PokemonsService } from './pokemons.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Pokemon } from './entities/pokemon.entity';
import { Sprites } from './interfaces/pokeapi-pokemon.response';

describe( 'PokemonsService', () => {
  let service: PokemonsService;

  beforeEach( async () => {
    const module: TestingModule = await Test.createTestingModule( {
      providers: [ PokemonsService ],
    } ).compile();

    service = module.get<PokemonsService>( PokemonsService );
  } );

  it( 'should be defined', () => {
    expect( service ).toBeDefined();
  } );

  it( 'should create a pokemon', async () => {
    const data = { name: 'Pikachu', type: 'Electric' };

    const result = await service.create( data );

    expect( result ).toEqual(
      expect.objectContaining( data )
    );
  } );
  it( 'should return an error if the Pokémon already exists', async () => {
    const data = { name: 'Pikachu', type: 'Electric' };
    await service.create( data );

    await expect( service.create( data ) ).rejects.toThrow( BadRequestException );
    await expect( service.create( data ) ).rejects.toThrow( `Pokemon with name ${ data.name } already exists` );


    //expect( result ).toBe( 'BadRequestException' );
  } );

  it( 'should return pokemon if exists', async () => {
    const id = 4;

    const result = await service.findOne( id );

    expect( result ).toEqual( {
      id: 4,
      name: 'charmander',
      type: 'fire',
      hp: 39,
      sprites: [
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/4.png',
      ],
    } );
  } );

  it( "should return 404 error if pokemon doesn't exits", async () => {
    const id = 400_000;

    await expect( service.findOne( id ) ).rejects.toThrow( NotFoundException );
    await expect( service.findOne( id ) ).rejects.toThrow(
      `Pokemon with id ${ id } not found`,
    );
  } );

  it( 'should check properties of the pokemon', async () => {
    const id = 4;
    const pokemon = await service.findOne( id );

    expect( pokemon ).toHaveProperty( 'id' );
    expect( pokemon ).toHaveProperty( 'name' );

    expect( pokemon ).toEqual(
      expect.objectContaining( {
        id: id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        hp: expect.any( Number ),
      } ),
    );
  } );

  it( 'should find all pokemons and cache them', async () => {
    const pokemons = await service.findAll( { limit: 10, page: 1 } );

    expect( pokemons ).toBeInstanceOf( Array );
    expect( pokemons.length ).toBe( 10 );

    expect( service.paginatedPokemonsCache.has( '10-1' ) ).toBeTruthy();
    expect( service.paginatedPokemonsCache.get( '10-1' ) ).toBe( pokemons );
  } );

  it( 'should return the cached data if the cache key exists', async () => {

    const paginationDto = {
      limit: 10,
      page: 1,
    };
    const cacheKey = `${ paginationDto.limit }-${ paginationDto.page }`;

    const cachedPokemons: Pokemon[] = [
      {
        id: 25,
        name: 'Pikachu',
        type: 'Electric',
        hp: 100,
        sprites: [],
      },
    ];
    service.paginatedPokemonsCache.set( cacheKey, cachedPokemons );

    const result = await service.findAll( paginationDto );

    expect( result ).toEqual( cachedPokemons );

  } );

  it( 'should return pokemon from cache if it exists', async () => {
    const pokemon = {
      id: 25,
      name: 'Pikachu',
      type: 'Electric',
      hp: 0,
      sprites: [],
    };
    service.pokemonsCache.set( 25, pokemon );
    const busqueda = await service.findOne( 25 );

    expect( busqueda ).toEqual( pokemon );

  } );

  it( 'should update a pokemon if it exists', async () => {
    const pokemon = {
      id: 26,
      name: 'Raychu',
      type: 'Electric',
      hp: 0,
      sprites: [],
    };
    service.pokemonsCache.set( 26, pokemon );

    const pokemonUpdate = await service.update( 26, {
      name: 'Raychux',
      type: 'Electrico',
      hp: 0,
      sprites: [],
    } );

    expect( pokemonUpdate.id ).toBe( 26 );
    expect( pokemonUpdate.name ).toBe( 'Raychux' );
    expect( pokemonUpdate.type ).toBe( 'Electrico' );
    expect( pokemonUpdate.hp ).toBe( 0 );
    expect( pokemonUpdate.sprites ).toEqual( [] );
  } );

  it( 'should throw an exception if pokemon does not exist', async () => {
    const idPokemon = 4000;
    
    const pokemonNoExists = {
      name: 'Raychux',
      type: 'Electrico',
      hp: 0,
      sprites: [],
      } 
    
      const promise = service.update(idPokemon, pokemonNoExists);

    await expect( promise ).rejects.toThrow( NotFoundException );
    await expect( promise ).rejects.toThrow(
      `Pokemon with id ${ idPokemon } not found`,
    );
    
  } );

  it( 'should remove a pokemon if it exists', async () => {
    const pokemon = {
      id: 27,
      name: 'Raychu',
      type: 'Electric',
      hp: 0,
      sprites: [],
    };
    service.pokemonsCache.set( 27, pokemon );

    const pokemonRemove = await service.remove( +27);
    
    expect( pokemonRemove ).toBe( `Pokemon ${ pokemon.name } removed!`  );
    expect(service.pokemonsCache.has(27)).toBe(false);
    
  } );



} );

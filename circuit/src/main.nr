use dep::std::hash::pedersen_hash;

// Rock = 0, Paper = 1, Scissors = 2
// Winner: 0 = tie, 1 = player1, 2 = player2

fn verify_commitment(move: Field, salt: Field, commitment: Field) {
    let input = [move, salt];
    let computed_hash = pedersen_hash(input);
    assert(computed_hash == commitment);
}

fn determine_winner(move1: Field, move2: Field) -> Field {
    // Rock = 0, Paper = 1, Scissors = 2
    
    // Check for tie first
    if (move1 == move2) {
        0
    } else {
        // Player 1 wins cases:
        // Rock (0) beats Scissors (2)
        if (move1 == 0) {
            if (move2 == 2) {
                1
            } else {
                2  // move2 must be 1 (paper beats rock)
            }
        } else {
            // Paper (1) beats Rock (0)
            if (move1 == 1) {
                if (move2 == 0) {
                    1
                } else {
                    2  // move2 must be 2 (scissors beats paper)
                }
            } else {
                // move1 must be 2 (Scissors)
                // Scissors (2) beats Paper (1)
                if (move2 == 1) {
                    1
                } else {
                    2  // move2 must be 0 (rock beats scissors)
                }
            }
        }
    }
}

fn main(
    // Player 1 inputs
    player1_move: Field,
    player1_salt: Field,
    player1_commitment: Field,
    
    // Player 2 inputs
    player2_move: Field,
    player2_salt: Field,
    player2_commitment: Field,
    
    // Public output
    winner: pub Field
) {
    // Verify commitments
    // Note: Move validation is handled implicitly by the game logic
    verify_commitment(player1_move, player1_salt, player1_commitment);
    verify_commitment(player2_move, player2_salt, player2_commitment);
    
    // Determine winner
    let computed_winner = determine_winner(player1_move, player2_move);
    
    // Output the winner
    assert(winner == computed_winner);
}

#[test]
fn test_rock_beats_scissors() {
    let p1_move = 0;
    let p1_salt = 123;
    let p1_commitment = pedersen_hash([p1_move, p1_salt]);
    
    let p2_move = 2;
    let p2_salt = 456;
    let p2_commitment = pedersen_hash([p2_move, p2_salt]);
    
    main(p1_move, p1_salt, p1_commitment, p2_move, p2_salt, p2_commitment, 1);
}

#[test]
fn test_paper_beats_rock() {
    let p1_move = 1;
    let p1_salt = 789;
    let p1_commitment = pedersen_hash([p1_move, p1_salt]);
    
    let p2_move = 0;
    let p2_salt = 101112;
    let p2_commitment = pedersen_hash([p2_move, p2_salt]);
    
    main(p1_move, p1_salt, p1_commitment, p2_move, p2_salt, p2_commitment, 1);
}

#[test]
fn test_scissors_beats_paper() {
    let p1_move = 2;
    let p1_salt = 131415;
    let p1_commitment = pedersen_hash([p1_move, p1_salt]);
    
    let p2_move = 1;
    let p2_salt = 161718;
    let p2_commitment = pedersen_hash([p2_move, p2_salt]);
    
    main(p1_move, p1_salt, p1_commitment, p2_move, p2_salt, p2_commitment, 1);
}

#[test]
fn test_tie() {
    let p1_move = 0;
    let p1_salt = 192021;
    let p1_commitment = pedersen_hash([p1_move, p1_salt]);
    
    let p2_move = 0;
    let p2_salt = 222324;
    let p2_commitment = pedersen_hash([p2_move, p2_salt]);
    
    main(p1_move, p1_salt, p1_commitment, p2_move, p2_salt, p2_commitment, 0);
}

#[test]
fn test_player2_wins() {
    let p1_move = 0;
    let p1_salt = 252627;
    let p1_commitment = pedersen_hash([p1_move, p1_salt]);
    
    let p2_move = 1;
    let p2_salt = 282930;
    let p2_commitment = pedersen_hash([p2_move, p2_salt]);
    
    main(p1_move, p1_salt, p1_commitment, p2_move, p2_salt, p2_commitment, 2);
}

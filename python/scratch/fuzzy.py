
from modelA import BankAccount
import random
import string

def random_string(length=10):
    letters = string.ascii_letters
    return ''.join(random.choice(letters) for i in range(length))

def random_float(min_value=-1e6, max_value=1e6):
    return random.uniform(min_value, max_value)

def test_bank_account_fuzzing():
    # Randomly generate names and account numbers
    name = random_string()
    account_number = random_string(length=8)
    
    # Randomly generate an initial balance
    initial_balance = random_float()

    try:
        account = BankAccount(name, account_number, initial_balance)
        print(f"Created account: {account}")

        # Randomly deposit
        deposit_amount = random_float()
        print(f"Depositing: {deposit_amount}")
        account.deposit(deposit_amount)

        # Randomly withdraw
        withdraw_amount = random_float()
        print(f"Withdrawing: {withdraw_amount}")
        account.withdraw(withdraw_amount)

        # Check balance
        balance = account.get_balance()
        print(f"Balance check: {balance}")

        # Randomly choose a tax rate and calculate tax
        tax_rate = random_float(0, 1)
        print(f"Tax rate: {tax_rate}")
        tax_amount = account.calculate_tax(tax_rate)
        print(f"Tax amount: {tax_amount}")

        # Pay tax
        print(f"Paying tax")
        account.pay_tax(tax_rate)

        # Final check
        print(f"Final account state: {account}")

    except Exception as e:
        print(f"Error during fuzzing: {e}")

# Run the fuzzing tests multiple times
for _ in range(10):
    test_bank_account_fuzzing()
""" - Migrate Plan Date: 21/03/10-17:39:31

Revision ID: e27d9f39499f
Revises: 76e619df2c03
Create Date: 2021-03-10 11:39:32.573229

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e27d9f39499f'
down_revision = '76e619df2c03'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('catalog_id_document_types', sa.Column('length', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('catalog_id_document_types', 'length')
    # ### end Alembic commands ###
